"use client"

import { useState } from "react";
import { ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { OrderStatus, Size } from "@/app/generated/prisma";

type OrderItem = {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    size: Size;
    product: {
        name: string;
        image_url: string | null;
    };
};

type OrderProp = {
    id: number;
    orderedAt: string;
    total_final: number;
    status: OrderStatus;
    orderItems: OrderItem[];
};

export function OrderCard({ order }: { order: OrderProp }) {
    const [isOpen, setIsOpen] = useState(false);

    
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return { label: 'Pago', bg: 'bg-[#12581D] text-[#00FF28]' };
            case 'PENDING': return { label: 'Aguardando Pagamento', bg: 'bg-[#9A7300] text-[#FFE9A7]' };
            case 'CANCELED': return { label: 'Cancelado', bg: 'bg-[#900A00] text-[#FF7272]' };
            default: return { label: status, bg: 'bg-gray-500 text-white' };
        }
    };

    const statusInfo = getStatusStyle(order.status);

    const formattedDate = new Date(order.orderedAt).toLocaleDateString('pt-BR');

    return (
        <div className="bg-[#E5E5E5] rounded-xl overflow-hidden text-black transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#D4D4D4] transition-colors"
            >
                <div className="flex items-center gap-3 font-bold flex-wrap text-sm md:text-base">
                    <span>#{order.id.toString().padStart(4, '0')}</span>
                    <span>-</span>
                    <span>{formattedDate}</span>
                    <span>-</span>
                    <span>Total: R$ {order.total_final.toFixed(2).replace('.', ',')}</span>
                    <span>-</span>
                    <span className={`px-3 py-0.5 rounded-full text-xs ${statusInfo.bg}`}>
                        {statusInfo.label}
                    </span>
                </div>
                
                <ChevronDown 
                    size={24} 
                    className={`transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                />
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-300 bg-gray-50/50">
                        <div className="flex flex-col gap-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {item.product.image_url ? (
                                            <img 
                                                src={item.product.image_url} 
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="text-gray-400" />
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg leading-tight">
                                            {item.product.name} - R$ {item.unit_price.toFixed(2).replace('.', ',')}
                                        </span>
                                        <span className="text-gray-600 text-sm">
                                            Tamanho: {item.size} &nbsp;&nbsp;|&nbsp;&nbsp; 
                                            Quantidade: {item.quantity} &nbsp;&nbsp;
                                            (Total: R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}