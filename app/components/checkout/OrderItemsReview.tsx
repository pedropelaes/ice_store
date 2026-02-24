import { CartItemType } from "@/app/context/CheckoutContext";
import { ImageIcon } from "lucide-react";

interface OrderItemsReviewProps {
  cartItems: CartItemType[];
}

export function OrderItemsReview({ cartItems }: OrderItemsReviewProps) {
  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h3 className="font-bold text-lg mb-4 text-black">Resumo do pedido:</h3>
      
      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center shrink-0 overflow-hidden relative">
              {item.product.image_url ? (
                <img 
                  src={item.product.image_url} 
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={20} className="text-gray-400" />
              )}
            </div>
            
            <div className="flex flex-col">
              <p className="font-bold text-black text-sm">
                {item.product.name} - R$ {item.unit_price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-black font-medium mt-1">
                Tamanho: {item.size} &nbsp;&nbsp; Quantidade: {item.quantity} 
                
                {/* Total da linha (Preço x Quantidade) */}
                <span className="ml-2 text-gray-600 font-normal">
                  (Total: R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')})
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}