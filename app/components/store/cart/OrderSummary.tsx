"use client"

import { useState } from "react";
import { ShippingCalculator } from "./ShippingCalculator";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderSummaryProps {
  subtotal: number;
  isValidCart: boolean;
}

export function OrderSummary({ subtotal, isValidCart }: OrderSummaryProps) {
  const router = useRouter();

  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [calculatedCep, setCalculatedCep] = useState<string>("");
  const total = subtotal + (shippingFee || 0);

  const hasCalculatedShipping = shippingFee !== null;
  const canProceed = isValidCart && hasCalculatedShipping;

  const handleProceedToCheckout = () => {
    if (!canProceed) return;

    router.push(`/checkout?cep=${calculatedCep}&fee=${shippingFee}`);
  }

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
             {shippingFee === null 
               ? "A calcular" 
               : shippingFee === 0 
                  ? "Grátis" 
                  : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingFee)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-white/20 pt-4 mb-2">
        <span className="text-lg font-bold">Total:</span>
        <span className="text-xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
        </span>
      </div>

      <ShippingCalculator onCalculate={(fee, cepParam) => {
           setShippingFee(fee);
           if (cepParam) setCalculatedCep(cepParam); // Salva o CEP digitado
        }} />

      <button 
        disabled={!canProceed}
        onClick={handleProceedToCheckout}
        className={`w-full font-bold py-4 px-4 rounded-md mt-6 flex items-center justify-center gap-2 transition-colors uppercase text-sm tracking-wide
          ${canProceed 
            ? 'bg-green-700 hover:bg-green-800 text-white' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed' // Visual de botão bloqueado
          }
        `}
      >
        Prosseguir com a compra
        <ChevronRight size={18} />
      </button>

      {!isValidCart ? (
         <p className="text-[#9A0000] text-xs text-center mt-3 font-medium animate-pulse">
            Remova ou ajuste os itens indisponíveis para prosseguir.
         </p>
      ) : !hasCalculatedShipping ? (
         <p className="text-gray-300 text-xs text-center mt-3 font-medium animate-pulse">
            Calcule o frete para liberar o pagamento.
         </p>
      ) : null}
    </div>
  );
}