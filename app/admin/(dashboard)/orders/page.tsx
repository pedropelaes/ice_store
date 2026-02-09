"use client"

import { FileInput, ChevronDown, CircleDashed, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/app/components/admin/AdminPageHeader"; 
import { AdminToolbar } from "@/app/components/admin/AdminToolBar";
import { DateFilter } from "@/app/components/admin/DateFilter";
import { useQuery } from "@tanstack/react-query";

const ORDER_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    PAGO: { label: "Pago", bg: "#82FF95", text: "#00410A" },
    ENVIADO: { label: "Enviado", bg: "#7DD3FC", text: "#0c4a6e" }, 
    CANCELADO: { label: "Cancelado", bg: "#EF4444", text: "#7F1D1D" },
    PENDENTE: { label: "Pendente", bg: "#FFBF00", text: "#584200" }
};

export default function OrdersPage() {
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(false);

   /* const { data: orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: () => {}
    });*/


    return (
        <div className="w-full">
            
            <AdminPageHeader title="Lista de pedidos">
                <button className="btn-tertiary">
                    <FileInput size={16}/> Exportar
                </button>
            </AdminPageHeader>

            
            <div className="w-full bg-[#D9D9D9] rounded-xl shadow-sm p-6">
                
                
                <AdminToolbar searchValue={search} onSearchChange={setSearch}>
                    
                    <DateFilter date={filterDate} setDate={setFilterDate} />

                    <div className="relative">
                        <button 
                            className={`flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm font-medium text-black shadow-sm border hover:bg-gray-50 h-10 ${filterStatus ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onClick={() => setActiveDropdown(!activeDropdown)}
                        >
                            <CircleDashed size={16} />
                            <span>{filterStatus ? ORDER_STATUS_MAP[filterStatus]?.label : "Status"}</span>
                            {filterStatus ? (
                                <div onClick={(e) => { e.stopPropagation(); setFilterStatus(""); }} className="hover:text-red-500"><X size={14} /></div>
                            ) : (
                                <ChevronDown size={14} />
                            )}
                        </button>

                        {activeDropdown && (
                            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[150px] overflow-hidden text-black">
                                {Object.keys(ORDER_STATUS_MAP).map((key) => (
                                    <div 
                                        key={key}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                                        onClick={() => { setFilterStatus(key); setActiveDropdown(false); }}
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
                    {/*isLoadingOrders ? (
                        <div className="flex justify-center p-10">
                            <Loader2 className="animate-spin text-gray-500" size={32} />
                        </div>
                    ) : isErrorOrders ? (
                        <div className="text-red-500 text-center p-10">Erro ao carregar produtos.</div>
                    ) : (
                         a tabela vai aqui
                    )*/}
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-black text-sm border-b border-gray-200 bg-white">
                                    <th className="table-clickable-header group">Comprador</th>
                                    <th className="table-clickable-header group">Preço bruto</th>
                                    <th className="table-clickable-header group">Preço final</th>
                                    <th className="table-clickable-header group">Pedido em</th>
                                    <th className="table-clickable-header group">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-black text-sm bg-white/50"> 
                                
                                
                            </tbody>
                        </table>

                </div>
            </div>
        </div>
    )
}