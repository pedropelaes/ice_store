import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Size } from "@/app/generated/prisma";

// Tipagens mais rigorosas para o input do Front-end
interface ProductVariantInput {
    size: Size; // Define que deve ser do tipo Size (enum do Prisma)
    quantity: number | string;
}

interface ProductInput {
    name: string;
    description: string;
    price: number | string;
    discount_price?: number | string | null;
    image_url: string;
    category: string;
    variants: ProductVariantInput[];
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { password, products } = body;

        if (!password) {
            return NextResponse.json({ message: "Password is required" }, { status: 400 });
        }

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ message: "Nenhum produto enviado." }, { status: 400 });
        }
        
        const adminId = Number(session.user.id);

        if (isNaN(adminId)) {
            return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || !admin.passwordHash) {
            return NextResponse.json(
                { message: "Admin setup error: User not found or no password configured." }, 
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Wrong password" }, { status: 403 });
        }

        // Validação de integridade
        for (const p of products as ProductInput[]) { 
            const price = Number(p.price);
            if (isNaN(price) || price <= 0) {
                return NextResponse.json({ message: `Preço inválido para o produto ${p.name || 'desconhecido'}` }, { status: 400 });
            }
            if (!p.name || String(p.name).trim() === "") {
                return NextResponse.json({ message: "Um ou mais produtos estão sem nome." }, { status: 400 });
            }
        }

        const createdProducts = await prisma.$transaction(
            (products as ProductInput[]).map((p: ProductInput) => {
                
                const categoryList = p.category
                    .split(',')
                    .map((c: string) => c.trim())
                    .filter((c: string) => c.length > 0);

                const calculatedTotalStock = Array.isArray(p.variants) 
                    ? p.variants.reduce((acc: number, item: ProductVariantInput) => acc + Math.max(0, Number(item.quantity) || 0), 0)
                    : 0;

                return prisma.product.create({
                    data: {
                        name: String(p.name).trim(), // Forçando conversão para evitar conflitos de tipo
                        description: String(p.description).trim(),
                        price: Number(p.price), // O Prisma quer número, então convertemos aqui
                        discount_price: p.discount_price ? Number(p.discount_price) : null, 
                        image_url: String(p.image_url),
                        created_by: adminId,
                        totalStock: calculatedTotalStock,
                        
                        items: {
                            create: p.variants.map((variant: ProductVariantInput) => ({
                                size: variant.size, // O enum já vem certo pela interface
                                quantity: Math.max(0, Number(variant.quantity) || 0) // O Prisma quer número, convertemos com garantia de ser > 0
                            }))
                        },
                        
                        category: {
                            connectOrCreate: categoryList.map((catName: string) => ({
                                where: { name: catName },
                                create: { name: catName },
                            })),
                        },
                    },
                });
            })
        );

        revalidatePath("/admin/products");

        return NextResponse.json(createdProducts, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}