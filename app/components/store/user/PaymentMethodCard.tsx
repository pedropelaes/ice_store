"use client"

import { CreditCard, Trash2 } from 'lucide-react';

export type PaymentMethod = {
  id: number;
  brand: string;
  last4: string;
  provider: string;
};

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onDelete?: () => void;
}

export default function PaymentMethodCard({ method, onDelete }: PaymentMethodCardProps) {
  return (
    <div className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-between transition-all hover:border-gray-300">
      
      {/* Informações do Cartão */}
      <div className="flex items-center gap-4">
        <div className="bg-gray-100 p-3 rounded-md shrink-0">
          <CreditCard className="w-6 h-6 text-gray-700" />
        </div>
        
        <div>
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-gray-900 uppercase">
              {method.brand}
            </p>
            {/* Exibe o provider (ex: mercadopago) de forma sutil */}
            <span className="text-xs text-gray-500 capitalize">
              via {method.provider.replace('_', ' ')}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 tracking-widest mt-1 font-mono">
            **** **** **** {method.last4}
          </p>
        </div>
      </div>

      {/* Botão de Excluir (Opcional, mas já deixei a estrutura pronta) */}
      {onDelete && (
        <button 
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-4"
          title="Excluir cartão"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
}