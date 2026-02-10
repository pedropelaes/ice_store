import { AdminPageHeader } from "@/app/components/admin/AdminPageHeader";
import { SalesChart } from "@/app/components/admin/charts/SalesChart";
import { InfoCard } from "@/app/components/admin/InfoCard";
import { OrderStatusChart } from "@/app/components/admin/charts/OrdersChart";
import { Receipt, ShoppingBag, ShoppingBasket, UserCircle2 } from "lucide-react";
import { DashboardService } from "@/app/services/dashboard-service";

export default async function DashboardPage() {

    const [recentOrders, kpis, statusData, salesData] = await Promise.all([
        DashboardService.getRecentOrders(),
        DashboardService.getKPIs(),
        DashboardService.getOrderStatusDistribution(),
        DashboardService.getSalesByDay()
    ]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return { label: 'PAGO', className: 'bg-[#15803d]' };
            case 'PENDING': return { label: 'PENDENTE', className: 'bg-[#a16207]' }; 
            case 'CANCELED': return { label: 'CANCELADO', className: 'bg-[#991b1b]' }; 
            default: return { label: status, className: 'bg-gray-600' };
        }
    };
    
    return (
        <div className="w-full space-y-4">
            <AdminPageHeader title="Painel de controle">
            </AdminPageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                <InfoCard title="Faturamento mensal" value={kpis.monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} description={"+12 vs mês passado"} icon={Receipt} ></InfoCard>
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
        </div>
    )
}