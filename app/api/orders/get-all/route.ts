import { Prisma } from "@/app/generated/prisma";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 20;
        const skip = (page - 1) * limit;

        const search = searchParams.get("search");
        const status = searchParams.get("status");
        const date = searchParams.get("date");
        
        const sortField = searchParams.get("sort") || "orderedAt"; 
        const sortOrder = (searchParams.get("order") as "asc" | "desc") || "desc"; 

        const filters: Prisma.OrderWhereInput[] = [];

        if (search) {
            filters.push({
                OR: [
                    { client: { name: { contains: search, mode: 'insensitive' } } },
                    { client: { lastName: { contains: search, mode: 'insensitive' } } },
                    { client: { cpf: { contains: search, mode: 'insensitive' } } },
                ]
            });
        }

        if (status) {
            filters.push({ 
                status: status.toUpperCase() as Prisma.EnumOrderStatusFilter 
            });
        }

        if (date) {
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);

            filters.push({
                orderedAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            });
        }

        const whereCondition: Prisma.OrderWhereInput = filters.length > 0 ? { AND: filters } : {};
        
        let orderByCondition: Prisma.OrderOrderByWithRelationInput;

        switch (sortField) {
            case 'buyer':
            case 'client':
            case 'user':  
                orderByCondition = { client: { name: sortOrder } };
                break;
            case 'gross': 
                orderByCondition = { total_gross: sortOrder };
                break;
            case 'final': 
                orderByCondition = { total_final: sortOrder };
                break;
            case 'orderedAt':
            case 'date':
            default:
                orderByCondition = { orderedAt: sortOrder };
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

        const total = await prisma.order.count({ where: whereCondition });

        return NextResponse.json(
            { 
                data: orders,
                meta: { total, page, limit },
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        
        let errorMessage = "Erro ao buscar pedidos.";
        if (err instanceof Error) errorMessage = err.message;

        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}