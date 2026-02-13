import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validators/product";
import bcrypt from "bcrypt"
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { password: password, products } = body;

        if (!password) {
            return NextResponse.json({ message: "Password is required" }, { status: 400 });
        }

        if(!products || !Array.isArray(products) || products.length === 0){
            return NextResponse.json({ message: "Nenhum produto enviado." }, { status: 400 });
        }
        
        const adminId = Number(session.user.id);

        if(isNaN(adminId)){
            return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({
            where: {id: adminId}
        });

        if (!admin) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (!admin.passwordHash) {
            return NextResponse.json(
                { message: "Admin setup error: No password configured for this user." }, 
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);


        if (!isPasswordValid) {
            return NextResponse.json({ message: "Wrong password" }, { status: 403 });
        }

        const createdProducts = await prisma.$transaction(
            products.map((p: any) => {
                // Prepara as categorias
                const categoryList = p.category
                    .split(',')
                    .map((c: string) => c.trim())
                    .filter((c: string) => c.length > 0);

                return prisma.product.create({
                    data: {
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        discount_price: p.discount_price || null, // Novo campo
                        image_url: p.image_url,
                        created_by: adminId,
                        
                        items: {
                            create: p.variants.map((variant: any) => ({
                                size: variant.size,
                                quantity: variant.quantity
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

        revalidatePath("/admin/products")

        return NextResponse.json(createdProducts, {status: 201});

    }catch( error ){
        console.log(error)
        return NextResponse.json({message: "Internal error"}, {status: 500})
    }
}