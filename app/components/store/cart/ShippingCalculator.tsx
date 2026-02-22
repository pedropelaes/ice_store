"use client"

import { calculateShipping } from "@/app/actions/shipping";
import { Loader2, Truck } from "lucide-react";
import { useState, useTransition } from "react";

interface ShippingCalculatorProps {
  onCalculate?: (fee: number | null) => void;
}

export function ShippingCalculator({onCalculate}: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [error, setError] = useState("");
  const [shippingData, setShippingData] = useState<{ price: number, delivery_time: number, company: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2'); 
    }
    setCep(value);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShippingData(null);

    startTransition(async () => {
      const res = await calculateShipping(cep);
      
      if (res.success && res.price !== undefined) {
        setShippingData({
          price: res.price,
          delivery_time: res.delivery_time,
          company: res.company
        });
        
        if (onCalculate) onCalculate(res.price);
      } else {
        // Mostra o erro e zera o frete no Total
        setError(res.error || "Erro ao consultar transportadora.");
        if (onCalculate) onCalculate(null); 
      }
    });
  };

  return (
    <div className="mt-6 border-t border-gray-300/30 pt-4">
      <form onSubmit={handleCalculate}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="CEP de entrega*" 
              value={cep}
              onChange={handleCepChange}
              maxLength={9}
              disabled={isPending}
              className="w-full bg-white/90 border border-transparent text-black px-3 py-2 rounded-md outline-none text-sm focus:ring-2 focus:ring-green-600 disabled:opacity-70"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isPending || cep.length < 9}
            className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800 transition-colors disabled:bg-gray-500 flex items-center gap-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Calcular
          </button>
        </div>
        <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="text-xs text-white/70 underline mt-2 inline-block hover:text-white transition-colors">
          Não sei o meu CEP
        </a>
      </form>

      {/* MENSAGEM DE ERRO (Se o CEP for inválido ou a API falhar) */}
      {error && (
        <div className="mt-3 p-2 bg-red-100/10 border border-red-500/50 rounded text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* RESULTADO DO FRETE (Se deu tudo certo) */}
      {shippingData && (
        <div className="mt-4 p-3 bg-white/10 rounded-md border border-white/20 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <Truck size={16}/>
              {shippingData.company}
            </span>
            <span className="text-sm font-bold text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingData.price)}
            </span>
          </div>
          <span className="text-xs text-gray-300">
            Chegará em até {shippingData.delivery_time} dias úteis
          </span>
        </div>
      )}
    </div>
  );
}