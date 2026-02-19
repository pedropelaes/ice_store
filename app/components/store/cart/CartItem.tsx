"use client"

import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { updateCartItemQuantity, removeCartItem } from "@/app/actions/cart"; // Importe as actions

interface CartItemProps {
  item: {
    id: number;
    quantity: number;
    unit_price: number;
    size: string;
    maxStock: number;
    product: {
      id: number;
      name: string;
      image_url: string;
    }
  };
}

export function CartItemCard({ item }: CartItemProps) {
  const [isPending, startTransition] = useTransition(); // Controla o estado de loading
  
  const subtotal = item.unit_price * item.quantity;
  const isOutOfStock = item.maxStock === 0;
  const hasLessStockThanRequested = item.quantity > item.maxStock && item.maxStock > 0;

  const maxOptions = item.maxStock > 0 ? item.maxStock : 1;
  const displayOptionsCount = Math.min(maxOptions, 10); 

  // Função para lidar com a mudança do select
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = Number(e.target.value);
    
    startTransition(async () => {
      await updateCartItemQuantity(item.id, newQuantity);
    });
  };

  // Função para lidar com a lixeira
  const handleRemove = () => {
    startTransition(async () => {
      await removeCartItem(item.id);
    });
  };

  return (
    <div className={`flex items-center gap-4 py-6 border-b border-gray-100 last:border-0 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
      
      {/* Imagem */}
      <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
        {item.product.image_url ? (
          <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">Sem foto</div>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="flex-1 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-base font-bold text-gray-900 truncate">{item.product.name}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>Tamanho: <strong className="text-gray-900">{item.size}</strong></span>
            <span>Preço: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}</span>
          </div>

          {/* Avisos Visuais de Estoque */}
          {isOutOfStock && (
            <p className="text-red-600 text-xs flex items-center gap-1 mt-2 font-semibold">
              <AlertCircle size={14} /> Produto esgotado
            </p>
          )}
          {hasLessStockThanRequested && (
            <p className="text-orange-600 text-xs flex items-center gap-1 mt-2">
              <AlertCircle size={14} /> Apenas {item.maxStock} em estoque. Atualize a quantidade.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 relative">
            <span className="text-sm text-gray-600">Qtd:</span>
            <select 
              value={item.quantity > item.maxStock ? item.maxStock : item.quantity} 
              onChange={handleQuantityChange}
              disabled={isOutOfStock || isPending} 
              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-black disabled:bg-gray-100"
            >
              {Array.from({ length: displayOptionsCount }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            
            {isPending && <Loader2 size={14} className="animate-spin text-gray-400 absolute -right-5" />}
          </div>
          
          <span className="font-bold text-gray-900">
             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
          </span>
        </div>
      </div>

      <button 
        onClick={handleRemove}
        disabled={isPending}
        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors h-fit self-start mt-1 disabled:opacity-50"
        title="Remover item"
      >
        <Trash2 size={20} />
      </button>

    </div>
  );
}