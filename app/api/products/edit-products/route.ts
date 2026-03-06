import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import { Size } from "@/app/generated/prisma";

interface UpdateItemInput {
    size: Size;
    quantity: number | string;
}

interface ProductUpdateInput {
    category?: (number | string)[];
    items?: UpdateItemInput[];
    quantity?: string | number; 
    active?: string;
    price?: number | string;
    discount_price?: number | string;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    [key: string]: unknown; 
}

type BatchUpdatePayload = Record<string, ProductUpdateInput>;

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
        }

        // 2. Forçamos o TypeScript a entender o formato dos dados
        const data = (await req.json()) as BatchUpdatePayload;

        const productIds = Object.keys(data);
        if (productIds.length === 0) {
            return NextResponse.json({ message: "Nenhuma alteração enviada" }, { status: 400 });
        }

        const results = await prisma.$transaction(async (tx) => {
            const updatePromises = productIds.map(async (idStr) => {
                const id = Number(idStr);
                if (isNaN(id)) throw new Error(`ID de produto inválido: ${idStr}`);

                const updates = data[idStr];
                
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { category, items, quantity: _quantity, ...simpleFields } = updates;

                const existingProduct = await tx.product.findUnique({
                    where: { id: id }
                });

                if (!existingProduct) throw new Error(`Produto #${id} não encontrado.`);

                const prismaUpdateData: Record<string, unknown> = { ...simpleFields };

                const isActivating = simpleFields.active === 'ACTIVE';

                if (isActivating) {
                    const weight = simpleFields.weight ?? existingProduct.weight;
                    const height = simpleFields.height ?? existingProduct.height;
                    const width = simpleFields.width ?? existingProduct.width;
                    const length = simpleFields.length ?? existingProduct.length;

                    if (!weight || !height || !width || !length) {
                        throw new Error(`O produto "${existingProduct.name}" não pode ser ativado pois faltam dados de frete (peso ou dimensões completas).`);
                    }

                    prismaUpdateData.launched_at = new Date();
                }

                if (simpleFields.price !== undefined) {
                    const price = Number(simpleFields.price);
                    if (isNaN(price) || price <= 0) throw new Error(`Preço inválido para o produto "${existingProduct.name}".`);
                    prismaUpdateData.price = price;
                }

                if (category && Array.isArray(category)) {
                    const categoryIds: number[] = [];
                    const newCategoryNames: string[] = [];

                    category.forEach((item) => {
                        if (typeof item === 'number') {
                            categoryIds.push(item);
                        } else if (typeof item === 'string' && item.trim() !== '') {
                            newCategoryNames.push(item.trim());
                        }
                    });

                    for (const name of newCategoryNames) {
                        const cat = await tx.category.upsert({
                            where: { name: name },
                            update: {},
                            create: { name: name }
                        });
                        categoryIds.push(cat.id);
                    }

                    prismaUpdateData.category = {
                        set: categoryIds.map((cId) => ({ id: cId })),
                    };
                }

                if (items && Array.isArray(items)) {
                    const itemPromises = items.map(async (item: UpdateItemInput) => {
                        if (!item.size) return;
                        const safeQuantity = Math.max(0, Number(item.quantity) || 0);

                        return tx.productItem.upsert({
                            where: {
                                product_id_size: {
                                    product_id: id,
                                    size: item.size 
                                }
                            },
                            update: { quantity: safeQuantity },
                            create: {
                                product_id: id,
                                size: item.size,
                                quantity: safeQuantity
                            }
                        });
                    });
                    await Promise.all(itemPromises);

                    const aggregate = await tx.productItem.aggregate({
                        where: { product_id: id },
                        _sum: { quantity: true }
                    });
                    
                    prismaUpdateData.totalStock = aggregate._sum.quantity || 0;
                }

                if (Object.keys(prismaUpdateData).length > 0) {
                    return tx.product.update({
                        where: { id: id },
                        data: prismaUpdateData,
                    });
                }

                return { id, status: "items updated" };
            });

            return Promise.all(updatePromises);
        });

        return NextResponse.json({
            message: "Produtos atualizados com sucesso",
            count: results.length
        });

    } catch (error) {
        console.error("Erro no Batch Update:", error);
        let errorMessage = "Erro ao atualizar produtos";
        
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === "string") {
            errorMessage = error;
        }

        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
}