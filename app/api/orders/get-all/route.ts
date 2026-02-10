import { Prisma } from "@/app/generated/prisma";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try{
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 20;
        const skip = (page - 1) * limit;

        const search = searchParams.get("search");
        const status = searchParams.get("status");
        const date = searchParams.get("date");
        
        const sortField = searchParams.get("sort") || "ordered_at"; 
        const sortOrder = searchParams.get("order") || "desc"; 

        const filters: Prisma.OrderWhereInput[] = [];

        if(search){
            filters.push({
                OR: [
                    { client: { name: { contains: search, mode: 'insensitive' } } },
                    { client: { lastName: { contains: search, mode: 'insensitive' } } },
                    { client: { cpf: { contains: search, mode: 'insensitive' } } },
                ]
            })
        }

        if (status) {
            filters.push({ 
                status: status.toUpperCase() as any 
            });
        }

        if(date){
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);

            filters.push({
                orderedAt: {
                    gte: startOfDay, // Maior ou igual ao inicio do dia
                    lte: endOfDay    // Menor ou igual ao fim do dia
                }
            });
        }

        const whereCondition: Prisma.OrderWhereInput = filters.length > 0 ? { AND: filters } : {};

        const validOrder = sortOrder === 'asc' ? 'asc' : 'desc';
        
        let orderByCondition: any = {};

        switch (sortField) {
            case 'buyer':
            case 'client':
            case 'user':  
                orderByCondition = { client: { name: validOrder } };
                break;
            
            case 'date': 
            case 'orderedAt':
                orderByCondition = { orderedAt: validOrder };
                break;

            case 'gross': 
                orderByCondition = { total_gross: validOrder };
                break;

            case 'final': 
                orderByCondition = { total_final: validOrder };
                break;

            default:
                orderByCondition = { orderedAt: 'desc' };
                break;
        }

        const orders = await prisma.order.findMany({
            where: whereCondition,
            orderBy: orderByCondition,
            take: limit,
            skip: skip,
            include: {
                client: {
                    select: {
                        name: true,
                        lastName: true,
                        email: true,
                        cpf: true,
                    }
                }
            }
        });

        const total = await prisma.order.count({ where: whereCondition});
        return NextResponse.json(
            { 
                data: orders,
                meta: { total, page, limit },
            },
            { status: 200 }
        );
    }catch(err){
        console.log(err);
        return NextResponse.json({ message: "Error while getting products" }, { status: 500 });
    }
}