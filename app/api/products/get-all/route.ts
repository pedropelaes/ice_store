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

        const whereCondition: Prisma.ProductWhereInput = filters.length > 0 ? { AND: filters } : {};

        const validOrder = sortOrder === 'asc' ? 'asc' : 'desc';
        
        const orderByCondition = {
            [sortField]: validOrder 
        };

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