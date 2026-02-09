import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try{
        const data = await req.json();

        const productIds = Object.keys(data);
        if(productIds.length === 0){
            return NextResponse.json({message: "Nenhuma alteração enviada"}, { status: 400});
        }

        const results = await prisma.$transaction(async (tx) => {
            const updatePromises = productIds.map(async (idStr) => {
                const id = Number(idStr);
                const updates = data[idStr];

                const { category, ...simpleFields } = updates;

                let prismaUpdateData: any = { ...simpleFields };

                if(category && Array.isArray(category)) {
                    const categoryIds: number[] = [];
                    const newCategoryNames: string[] = [];

                    category.forEach((item: string | number) => {
                        if(typeof item === 'number'){
                            categoryIds.push(item);
                        }else if(typeof item === 'string'){
                            newCategoryNames.push(item);
                        }
                    });

                    for (const name of newCategoryNames){
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

                return tx.product.update({
                    where: { id: id },
                    data: prismaUpdateData,
                });
            });

            return Promise.all(updatePromises);
        });

        return NextResponse.json({ 
            message: "Produtos atualizados com sucesso", 
            count: results.length 
        });

    } catch (error) {
        console.error("Erro no Batch Update:", error);
        return NextResponse.json({ error: "Erro ao atualizar produtos" }, { status: 500 });
    }
}