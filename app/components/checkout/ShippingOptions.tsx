"use client"

import { useEffect, useState } from "react";
import { Loader2, Truck, Check } from "lucide-react";
import { calculateShipping } from "@/app/actions/shipping";

export interface ShippingOption {
  id: number;
  company: string;
  method: string;
  price: number;
  delivery_time: number;
}

interface ShippingOptionsProps {
  cep: string;
  selectedOptionId: number | null;
  onSelect: (option: ShippingOption) => void;
}

export function ShippingOptions({ cep, selectedOptionId, onSelect }: ShippingOptionsProps) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const cleanCep = cep.replace(/\D/g, "");

  useEffect(() => {
    if (cleanCep.length === 8) {
      const fetchShipping = async () => {
        setIsLoading(true);
        setError("");
        
        const res = await calculateShipping(cleanCep);
        
        if (res.success && res.options) {
          setOptions(res.options);
          if (res.options.length > 0 && !selectedOptionId) {
            onSelect(res.options[0]);
          }
        } else {
          setError(res.error || "Erro ao calcular frete para este CEP.");
          setOptions([]);
        }
        setIsLoading(false);
      };

      fetchShipping();
    } else {
      setOptions([]); 
    }
  }, [cleanCep]);

  if (cleanCep.length !== 8) return null;

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <h3 className="text-lg font-bold text-black mb-4 border-t pt-8">Opções de entrega:</h3>
      
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500 py-4">
          <Loader2 size={20} className="animate-spin" /> Buscando transportadoras...
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt)}
              className={`relative flex items-center justify-between p-4 rounded-xl text-left transition-all w-full md:w-2/3
                ${isSelected 
                  ? "bg-[#333333] text-white border-2 border-[#3b82f6]"
                  : "bg-[#4B4B4B] text-gray-200 border-2 border-transparent hover:bg-[#333333]"
                }
              `}
            >
              <div className="flex flex-col">
                <span className="font-bold flex items-center gap-2">
                  <Truck size={18} /> {opt.company} {opt.method && `- ${opt.method}`}
                </span>
                <span className="text-xs mt-1 text-gray-400">
                  Chegará em até {opt.delivery_time} dias úteis
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-bold text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.price)}
                </span>
                {isSelected ? (
                  <span className="text-[#3b82f6] text-xs font-bold mt-1 flex items-center gap-1">
                    Selecionado <Check size={14} />
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs mt-1 underline decoration-gray-500 hover:text-white">
                    Clique para selecionar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}