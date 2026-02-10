import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 20;
        const skip = (page - 1) * limit;

        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const status = searchParams.get("status");
        const date = searchParams.get("date");
        
        const sortField = searchParams.get("sort") || "created_at"; 
        const sortOrder = searchParams.get("order") || "desc"; 

        const filters: Prisma.ProductWhereInput[] = [];

        if (search) {
            filters.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        if (category) {
            filters.push({
                category: {
                    some: { 
                        name: {
                            equals: category,
                            mode: 'insensitive' 
                        }
                    }
                }
            });
        }

        if(status) {
            filters.push({ active: status.toUpperCase() as any });
        }

        if(date){
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);

            filters.push({
                created_at: {
                    gte: startOfDay, // Maior ou igual ao inicio do dia
                    lte: endOfDay    // Menor ou igual ao fim do dia
                }
            });
        }

        const whereCondition: Prisma.ProductWhereInput = filters.length > 0 ? { AND: filters } : {};

        const validOrder = sortOrder === 'asc' ? 'asc' : 'desc';
        
        let orderByCondition: any = {};

        switch (sortField) {
            case 'created_by':
                orderByCondition = { admin: { name: validOrder } };
                break;
            
            case 'category':
                orderByCondition = { category: { _count: validOrder } }; // N:N -> order by quantity
                break;

            default:
                orderByCondition = { [sortField]: validOrder };
                break;
        }

        const products = await prisma.product.findMany({
            where: whereCondition,
            orderBy: orderByCondition,
            take: limit,
            skip: skip,
            include: {
                category: true,
                admin: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        const total = await prisma.product.count({ where: whereCondition });
        return NextResponse.json(
            {
                data: products,
                meta: { total, page, limit }, 
            },
            { status: 200 }
        );

    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Error while getting products" }, { status: 500 });
    }
}