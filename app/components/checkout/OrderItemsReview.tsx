import { ImageIcon } from "lucide-react";

export function OrderItemsReview() {
  // Mock temporário simulando os itens do seu Figma
  const items = [
    { id: 1, name: "<Nome do produto>", price: 99.99, size: "<x>", quantity: 5, oldPrice: 499.95 },
    { id: 2, name: "<Nome do produto>", price: 99.99, size: "<x>", quantity: 5, oldPrice: 499.95 },
  ];

  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h3 className="font-bold text-lg mb-4 text-black">Resumo do pedido:</h3>
      
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-400 rounded-md flex items-center justify-center shrink-0">
              <ImageIcon size={20} className="text-white" />
            </div>
            
            <div className="flex flex-col">
              <p className="font-bold text-black text-sm">
                {item.name} - R$ {item.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-black font-medium">
                Tamanho: {item.size} &nbsp;&nbsp; Quantidade: {item.quantity} 
                <span className="ml-2 text-gray-500 line-through font-normal">
                  R$ {item.oldPrice.toFixed(2).replace('.', ',')}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}