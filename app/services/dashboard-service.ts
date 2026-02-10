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
        
        // 1. Definir intervalos de tempo
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [monthlyRevenue, ordersToday, globalStats, totalUsers] = await Promise.all([
           
            prisma.order.aggregate({
                _sum: { total_final: true },
                where: {
                    orderedAt: {
                        gte: startOfMonth 
                    },
                    status: 'PAID'
                }
            }),

            
            prisma.order.count({
                where: { orderedAt: { gte: startOfDay } }
            }),

            
            prisma.order.aggregate({
                _sum: { total_final: true },
                _count: { id: true }
            }),

            
            prisma.user.count({
                where: { role: 'USER' }
            })
        ]);
        const currentMonthlyRevenue = Number(monthlyRevenue._sum.total_final || 0);
        
        const totalGlobalRevenue = Number(globalStats._sum.total_final || 0);
        const totalGlobalOrders = globalStats._count.id || 0;

        
        const averageTicket = totalGlobalOrders > 0 
            ? totalGlobalRevenue / totalGlobalOrders 
            : 0;

        return {
            monthlyRevenue: currentMonthlyRevenue,
            ordersToday,
            averageTicket,
            totalUsers,
            totalOrders: totalGlobalOrders // Caso precise usar em outro lugar
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
    }
}