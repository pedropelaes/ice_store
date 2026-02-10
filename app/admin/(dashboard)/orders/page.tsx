"use client"

import { FileInput, ChevronDown, CircleDashed, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/app/components/admin/AdminPageHeader"; 
import { AdminToolbar } from "@/app/components/admin/AdminToolBar";
import { DateFilter } from "@/app/components/admin/DateFilter";
import { useQuery } from "@tanstack/react-query";
import { OrderStatus } from "@/app/generated/prisma";
import { useAdminTable } from "@/app/hooks/useAdminTableSort";
import { useClickOutside } from "@/app/hooks/useClickOutside";

const ORDER_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    PAID: { label: "Pago", bg: "#82FF95", text: "#00410A" },
    SHIPPED: { label: "Enviado", bg: "#7DD3FC", text: "#0c4a6e" }, 
    CANCELED: { label: "Cancelado", bg: "#EF4444", text: "#7F1D1D" },
    PENDING: { label: "Pendente", bg: "#FFBF00", text: "#584200" }
};

/*interface Order {
    id: number,
    total_final: number,
    total_gross: number,
    status: OrderStatus,
    user: { name: string, lastName: string, email: string, cpf: string}
}*/

async function getOrders(search: string, sort: string, order: string, date: string, status: string, page: number) {
    const params = new URLSearchParams();
    if(search) params.append("search", search);
    if(status) params.append("status", status);
    if(date) params.append("date", date);
    
    params.append("sort", sort);
    params.append("order", order);

    params.append("page", page.toString());
    params.append("limit", "20");

    const url = `/api/orders/get-all?${params.toString()}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error("Erro ao buscar pedidos");
    return res.json();
}

export default function OrdersPage() {

    const table = useAdminTable({ initialSortField: "created_at" });

    const [filterDate, setFilterDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    
    const statusDropdown = useClickOutside<HTMLDivElement>();

    const { data: orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useQuery({
        queryKey: ['orders', table.debouncedSearch, table.sortConfig, filterDate, filterStatus],
        queryFn: () => getOrders(table.search, table.sortConfig.field, table.sortConfig.order, filterDate, filterStatus, table.page),
    });

    const totalItems = orders?.meta?.total || 0;
    const itemsPerPage = orders?.meta?.limit || 20;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="w-full">
            
            <AdminPageHeader title="Lista de pedidos">
                <button className="btn-tertiary">
                    <FileInput size={16}/> Exportar
                </button>
            </AdminPageHeader>

            
            <div className="w-full bg-[#D9D9D9] rounded-xl shadow-sm p-6">
                
                
                <AdminToolbar searchValue={table.search} onSearchChange={table.setSearch}>
                    
                    <DateFilter date={filterDate} setDate={(val) => { setFilterDate(val); table.setPage(1); }} />

                    <div className="relative" ref={statusDropdown.ref}>
                        <button 
                            className={`flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm font-medium text-black shadow-sm border hover:bg-gray-50 h-10 ${filterStatus ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onClick={() => statusDropdown.setIsOpen(!statusDropdown.isOpen)}
                        >
                            <CircleDashed size={16} />
                            <span>{filterStatus ? ORDER_STATUS_MAP[filterStatus]?.label : "Status"}</span>
                            {filterStatus ? (
                                <div onClick={(e) => { e.stopPropagation(); setFilterStatus(""); table.setPage(1)}} className="hover:text-red-500"><X size={14} /></div>
                            ) : (
                                <ChevronDown size={14} />
                            )}
                        </button>

                        {statusDropdown.isOpen && (
                            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[150px] overflow-hidden text-black">
                                {Object.keys(ORDER_STATUS_MAP).map((key) => (
                                    <div 
                                        key={key}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                                        onClick={() => { setFilterStatus(key); statusDropdown.setIsOpen(false); table.setPage(1) }}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ORDER_STATUS_MAP[key].bg}}></div>
                                        {ORDER_STATUS_MAP[key].label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </AdminToolbar>

                
                <div className="overflow-x-auto">
                    {isLoadingOrders ? (
                        <div className="flex justify-center p-10">
                            <Loader2 className="animate-spin text-gray-500" size={32} />
                        </div>
                    ) : isErrorOrders ? (
                        <div className="text-red-500 text-center p-10">Erro ao carregar produtos.</div>
                    ) : (
                         <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-black text-sm border-b border-gray-200 bg-white">
                                    <th className="table-clickable-header group"
                                        onClick={() => table.handleSort("buyer")}
                                    >
                                        <div className="flex items-center gap-2 ">
                                            Comprador
                                            {table.renderSortIcon("buyer")}
                                        </div>
                                    </th>
                                    <th className="table-clickable-header group"
                                        onClick={() => table.handleSort("gross")}
                                    >
                                        <div className="flex items-center gap-2 ">
                                            Preço bruto
                                            {table.renderSortIcon("gross")}
                                        </div>
                                    </th>
                                    <th className="table-clickable-header group"
                                        onClick={() => table.handleSort("final")}
                                    >
                                        <div className="flex items-center gap-2 ">
                                            Preço final
                                            {table.renderSortIcon("final")}
                                        </div>
                                    </th>
                                    <th className="table-clickable-header group"
                                        onClick={() => table.handleSort("orderedAt")}
                                    >
                                        <div className="flex items-center gap-2 ">
                                            Pedido em
                                            {table.renderSortIcon("orderedAt")}
                                        </div>
                                        
                                    </th>
                                    <th className="table-clickable-header group"
                                        onClick={() => table.handleSort("status")}
                                    >
                                        <div className="flex items-center gap-2 ">
                                            Status
                                            {table.renderSortIcon("status")}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-black text-sm"> 
                                {orders?.data?.map((order: any) => {
                                    const statusConfig = ORDER_STATUS_MAP[order.status] || { 
                                        label: order.status, 
                                        bg: "#E5E7EB", 
                                        text: "#374151" 
                                    };

                                    return (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">

                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{`${order.client.name} ${order.client.lastName}`}</span>
                                                <span className="text-xs text-gray-500" title="CPF">{`${order.client.email} | ${order.client.cpf}`}</span>
                                            </div>
                                        </td>

                                        <td className="p-4 text-gray-800">
                                            R$ {Number(order.total_gross).toFixed(2).replace('.', ',')}
                                        </td>

                                        <td className="p-4 font-bold text-gray-900">
                                            R$ {Number(order.total_final).toFixed(2).replace('.', ',')}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span>{new Date(order.orderedAt).toLocaleDateString('pt-BR')}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(order.orderedAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span 
                                                className="px-3 py-1 rounded text-xs font-bold inline-block"
                                                style={{ 
                                                    backgroundColor: statusConfig.bg, 
                                                    color: statusConfig.text 
                                                }}
                                            >
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                    </tr>
                                    )
                                })}
                                
                            </tbody>
                        </table>
                    )}
                        
                </div>
                    {!isLoadingOrders && !isErrorOrders && (
                    <div className="flex items-center justify-between mt-4 border-t border-gray-300 pt-4">
                        <span className="text-sm text-gray-500">
                            Mostrando página <strong>{table.page}</strong> de <strong>{totalPages || 1}</strong> 
                            <span className="ml-2">({totalItems} produtos)</span>
                        </span>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => table.setPage(old => Math.max(old - 1, 1))}
                                disabled={table.page === 1}
                                className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <button 
                                onClick={() => table.setPage(old => (old < totalPages ? old + 1 : old))}
                                disabled={table.page >= totalPages}
                                className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}