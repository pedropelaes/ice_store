import { AdminPageHeader } from "@/app/components/admin/AdminPageHeader";
import { SalesChart } from "@/app/components/admin/charts/SalesChart";
import { InfoCard } from "@/app/components/admin/InfoCard";
import { OrderStatusChart } from "@/app/components/admin/charts/OrdersChart";
import { Activity, CandlestickChart, Minus, Receipt, ShoppingBag, ShoppingBasket, TrendingDown, TrendingUp, UserCircle2, Warehouse } from "lucide-react";
import { DashboardService } from "@/app/services/dashboard-service";
import { LowStockWidget } from "@/app/components/admin/widgets/LowStockWidget";

export default async function DashboardPage() {

    const [recentOrders, kpis, statusData, salesData, lowStockData] = await Promise.all([
        DashboardService.getRecentOrders(),
        DashboardService.getKPIs(),
        DashboardService.getOrderStatusDistribution(),
        DashboardService.getSalesByDay(),
        DashboardService.getLowStockProducts(5),
    ]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return { label: 'PAGO', className: 'bg-[#15803d]' };
            case 'PENDING': return { label: 'PENDENTE', className: 'bg-[#a16207]' }; 
            case 'CANCELED': return { label: 'CANCELADO', className: 'bg-[#991b1b]' }; 
            default: return { label: status, className: 'bg-gray-600' };
        }
    };

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return { percent: 0, diff: current }; 
        return {
            percent: ((current - previous) / previous) * 100,
            diff: current - previous
        };
    };

    const growth = calculateGrowth(kpis.monthlyRevenue, kpis.lastMonthRevenue);

    const renderGrowthLabel = () => {
        const percentValue = growth.percent.toFixed(1);
        
        if (growth.percent === 0) {
            return (
                <span className="text-sm font-medium text-gray-400 mt-1 flex items-center gap-1">
                    <Minus size={10} /> 0% vs mês passado
                </span>
            );
        }

        // CASO 2: Lucro (Positivo)
        if (growth.percent > 0) {
            return (
                <span className="text-sm font-medium text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={10} /> +{percentValue}% vs mês passado
                </span>
            );
        }

        // CASO 3: Perda (Negativo)
        return (
            <span className="text-sm font-medium text-red-500 mt-1 flex items-center gap-1">
                <TrendingDown size={10} /> {percentValue}% vs mês passado
            </span>
        );
    };
    
    return (
        <div className="w-full space-y-4">
            <AdminPageHeader title="Painel de controle">
            </AdminPageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                <InfoCard title="Faturamento mensal" value={kpis.monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} description={renderGrowthLabel()} icon={Receipt} ></InfoCard>
                <InfoCard title="Pedidos hoje" value={kpis.ordersToday.toString()}  icon={ShoppingBag}></InfoCard>
                <InfoCard title="Valor médio por compra" value={kpis.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={ShoppingBasket}></InfoCard>
                <InfoCard title="Usuários" value={kpis.totalUsers.toString()} icon={UserCircle2}></InfoCard>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 p-2">
                <SalesChart data={salesData}></SalesChart>

                <OrderStatusChart data={statusData}></OrderStatusChart>
            </div>

            <div className="p-2">
                <div className="w-full overflow-hidden rounded-lg shadow-md">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-[#383838] text-gray-200 font-medium">
                            <tr>
                                <th className="p-4 border-r border-[#525252] last:border-r-0">Usuário</th>
                                <th className="p-4 border-r border-[#525252] last:border-r-0">Data</th>
                                <th className="p-4 border-r border-[#525252] last:border-r-0">Valor</th>
                                <th className="p-4 border-r border-[#525252] last:border-r-0">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#434343] text-gray-300">
                            {recentOrders.map((order) => {
                                const statusInfo = getStatusStyle(order.status);
                                
                                return (
                                    <tr key={order.id} className="border-b border-[#525252] last:border-none hover:bg-[#4a4a4a] transition-colors">
                                        <td className="p-4 border-r border-[#525252] last:border-r-0 font-medium text-white">
                                            {order.client.name} {order.client.lastName}
                                        </td>
                                        <td className="p-4 border-r border-[#525252] last:border-r-0">
                                            {new Date(order.orderedAt).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="p-4 border-r border-[#525252] last:border-r-0">
                                            {Number(order.total_final).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        {/* Célula de Status colorida */}
                                        <td className={`p-4 border-r border-[#525252] last:border-r-0 font-semibold text-white ${statusInfo.className}`}>
                                            {statusInfo.label}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                <InfoCard title="Valor do estoque" value={kpis.stockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={CandlestickChart}></InfoCard>
                <InfoCard title="Produtos" value={kpis.totalStock.toString()} icon={Warehouse}></InfoCard>
                <InfoCard title="Produtos ativos" value={kpis.activeStock.toString()} icon={Activity}></InfoCard>
            </div>
            <div className="lg:col-span-1 h-full p-2">
                <LowStockWidget data={lowStockData} />
            </div>
        </div>
    )
}