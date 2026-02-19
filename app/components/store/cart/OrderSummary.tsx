"use client"

import { ShippingCalculator } from "./ShippingCalculator";
import { ChevronRight } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  shippingFee?: number;
}

export function OrderSummary({ subtotal, shippingFee = 0 }: OrderSummaryProps) {
  const total = subtotal + shippingFee;

  return (
    <div className="bg-[#999999] text-white p-6 rounded-xl shadow-sm sticky top-24">
      <h2 className="text-xl font-bold mb-6">Resumo do pedido:</h2>
      
      <div className="space-y-3 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-200">Subtotal:</span>
          <span className="font-medium">
             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-200">Frete:</span>
          <span className="font-medium">
             {shippingFee === 0 ? "A calcular" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingFee)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-white/20 pt-4 mb-2">
        <span className="text-lg font-bold">Total:</span>
        <span className="text-xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
        </span>
      </div>

      <ShippingCalculator />

      <button className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-4 rounded-md mt-6 flex items-center justify-center gap-2 transition-colors uppercase text-sm tracking-wide">
        Prosseguir com a compra
        <ChevronRight size={18} />
      </button>
    </div>
  );
}