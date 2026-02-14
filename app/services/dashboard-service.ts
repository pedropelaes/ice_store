import prisma from "../lib/prisma";


export interface DailySalesData {
    date: string;
    total: number;
}

export interface OrderStatusData {
    name: string;
    value: number;
    color: string;
}

export interface LowStockProduct {
    id: number;
    name: string;
    image_url: string;
    totalStock: number;
    items: {
        size: string;
        quantity: number;
    }[];
}


 
export const DashboardService = {
    getRecentOrders: async () => {
        return await prisma.order.findMany({
            take: 5,
            orderBy: {orderedAt: 'desc'},
            include: {
                client: { select: {
                    name: true,
                    lastName: true,
                }}
            }
        });
    },

    getKPIs: async () => {
        const today = new Date();
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        const [monthlyRevenue, lastMonthRevenue, ordersToday, globalStats, totalUsers, stockValueResult, totalStock, activeStock] = await Promise.all([
            prisma.order.aggregate({
                _sum: { total_final: true },
                where: { 
                    orderedAt: { gte: startOfMonth },
                    status: 'PAID' 
                }
            }),

            prisma.order.aggregate({
                _sum: { total_final: true },
                where: { 
                    orderedAt: { 
                        gte: startOfLastMonth, 
                        lte: endOfLastMonth ,
                    },
                    status: 'PAID' 
                }
            }),

            prisma.order.count({
                where: { 
                    orderedAt: { 
                        gte: new Date(new Date().setHours(0,0,0,0)) 
                    } 
                }
            }),

            prisma.order.aggregate({
                _sum: { total_final: true },
                _count: { id: true }
            }),

            prisma.user.count({ where: { role: 'USER' } }),

            prisma.$queryRaw<any[]>`
                SELECT COALESCE(SUM(price * "totalStock"), 0) as total
                FROM "Product"
                WHERE active = 'ACTIVE'
            `,

            prisma.product.count(),

            prisma.product.count({ where: { active: 'ACTIVE' } })
        ]);

        const currentRevenue = Number(monthlyRevenue._sum.total_final || 0);
        const lastRevenue = Number(lastMonthRevenue._sum.total_final || 0);

        const totalGlobalRevenue = Number(globalStats._sum.total_final || 0);
        const totalGlobalOrders = globalStats._count.id || 0;
        const averageTicket = totalGlobalOrders > 0 ? totalGlobalRevenue / totalGlobalOrders : 0;
        const stockValue = Number(stockValueResult[0]?.total || 0);

        return {
            monthlyRevenue: currentRevenue,
            lastMonthRevenue: lastRevenue, 
            ordersToday,
            averageTicket,
            totalUsers,
            stockValue,
            totalStock, 
            activeStock,
        };
    },

    getOrderStatusDistribution: async (): Promise<OrderStatusData[]> => {
        const grouped = await prisma.order.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        return grouped.map(item => {
            let color = "#9ca3af"; 
            if (item.status === 'PAID') color = "#16a34a";
            if (item.status === 'PENDING') color = "#eab308";
            if (item.status === 'CANCELED') color = "#ef4444";
            
            return {
                name: item.status,
                value: item._count.status,
                color
            };
        });
    },

    getSalesByDay: async (): Promise<DailySalesData[]> => {
        const result = await prisma.$queryRaw<any[]>`
            SELECT 
                TO_CHAR("orderedAt", 'DD/MM') as date, 
                SUM("total_final") as total
            FROM "Order"
            WHERE "orderedAt" >= NOW() - INTERVAL '30 days'
            GROUP BY TO_CHAR("orderedAt", 'DD/MM'), "orderedAt"::DATE
            ORDER BY "orderedAt"::DATE ASC
        `;

        return result.map((r: any) => ({
            date: r.date,
            total: Number(r.total)
        }));
    },

    getLowStockProducts: async (threshold = 5): Promise<LowStockProduct[]> => {
        const products = await prisma.product.findMany({
            where: {
                active: 'ACTIVE', 
                items: {
                    some: {
                        quantity: {
                            lte: threshold
                        }
                    }
                }
            },
            take: 5, 
            select: {
                id: true,
                name: true,
                image_url: true,
                totalStock: true,
                items: {
                    where: {
                        quantity: {
                            lte: threshold // Traz apenas os tamanhos que estão acabando
                        }
                    },
                    orderBy: {
                        quantity: 'asc'
                    },
                    select: {
                        size: true,
                        quantity: true
                    }
                }
            }
        });

        return products;
    },
}