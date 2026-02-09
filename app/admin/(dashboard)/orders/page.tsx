"use client"

import { FileInput, ChevronDown, CircleDashed, X } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/app/components/admin/AdminPageHeader"; 
import { AdminToolbar } from "@/app/components/admin/AdminToolBar";
import { DateFilter } from "@/app/components/admin/DateFilter";

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

    // Mock de dados para visualizar (substituir depois pelo seu useQuery)
    const orders = [
        { id: 1, buyer: "João Silva", gross: 89.99, final: 99.99, date: "2025-12-12T18:35:00", status: "PAGO" },
        { id: 2, buyer: "Maria Souza", gross: 89.99, final: 99.99, date: "2025-12-12T18:35:00", status: "ENVIADO" },
    ];

    return (
        <div className="w-full">
            
            <AdminPageHeader title="Lista de pedidos">
                <button className="btn-tertiary">
                    <FileInput size={16}/> Exportar
                </button>
            </AdminPageHeader>

            {/* CONTAINER CINZA ENVOLVENDO TUDO */}
            <div className="w-full bg-[#D9D9D9] rounded-xl shadow-sm p-6">
                
                {/* 1. Barra de Ferramentas (Dentro do cinza) */}
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

                {/* 2. Tabela (Também dentro do cinza) */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-black text-sm border-b border-gray-200 bg-white">
                                <th className="p-4 w-10"><input type="checkbox" /></th>
                                <th className="p-4 font-medium">Comprador</th>
                                <th className="p-4 font-medium">Preço bruto</th>
                                <th className="p-4 font-medium">Preço final</th>
                                <th className="p-4 font-medium">Pedido em</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-black text-sm bg-white/50"> 
                            {/* Dica: Use bg-white/50 ou transparente no tbody se quiser ver o fundo cinza, ou bg-white para linhas brancas */}
                            {orders.map((order) => {
                                const statusConf = ORDER_STATUS_MAP[order.status];
                                return (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                                        <td className="p-4"><input type="checkbox" /></td>
                                        <td className="p-4 font-medium">{order.buyer}</td>
                                        <td className="p-4 text-gray-600">R$ {order.gross.toFixed(2).replace('.', ',')}</td>
                                        <td className="p-4 font-bold">R$ {order.final.toFixed(2).replace('.', ',')}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span>{new Date(order.date).toLocaleDateString('pt-BR')}</span>
                                                <span className="text-xs text-gray-500">{new Date(order.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold"
                                                style={{ backgroundColor: statusConf.bg, color: statusConf.text }}
                                            >
                                                {statusConf.label}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}