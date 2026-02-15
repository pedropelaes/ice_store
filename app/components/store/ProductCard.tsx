import { ImageOff } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: any; // Prisma Decimal vem como objeto ou string, trataremos como Number
    discount_price?: any | null;
    image_url: string;
    category?: { name: string }[];
    items?: { quantity: number }[];
    totalStock?: number; 
  };
}

export function ProductCard({ product }: ProductCardProps) {
    const stockCount = product.items 
        ? product.items.reduce((acc, item) => acc + item.quantity, 0) 
        : (product.totalStock || 0);
    
    const isOutOfStock = stockCount <= 0;

    const price = Number(product.price);
    const discountPrice = product.discount_price ? Number(product.discount_price) : null;
    const hasDiscount = discountPrice !== null && discountPrice < price;

    const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-300">
              <ImageOff size={48} />
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock && (
              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                Esgotado
              </span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                Oferta
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          {product.category && product.category.length > 0 && (
            <span className="text-xs text-gray-500 mb-1 block">
              {product.category[0].name}
            </span>
          )}

          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto">
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(price)}
                </span>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(discountPrice)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}