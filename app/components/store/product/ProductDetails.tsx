"use client"

import { startTransition, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Product, ProductItem, Size } from "@/app/generated/prisma";
import { addToCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";

interface ProductDetailsProps {
  product: Product & {
    items: ProductItem[];
    category: { name: string }[];
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // Calcular Estoque Disponível por Tamanho
  const getStockForSize = (size: string) => {
    const item = product.items.find((i) => i.size === size);
    return item?.quantity || 0;
  };

  // Manipuladores
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setQuantity(1); // Reseta quantidade ao mudar tamanho
  };

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "decrease") {
      setQuantity((prev) => Math.max(1, prev - 1));
    } else {
      if (!selectedSize) return;
      const maxStock = getStockForSize(selectedSize);
      setQuantity((prev) => Math.min(maxStock, prev + 1));
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;

    startTransition(async () => {
      const result = await addToCart(product.id, selectedSize as Size, quantity);

      if (result.success) {
        router.push('/cart');
      } else {
        if (result.error === "Você precisa estar logado para adicionar itens.") {
            alert(result.error);
            router.push('/auth/login');
        } else {
            alert(result.error);
        }
      }
    });
  };

  const handleManualQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSize) return;

    let newValue = parseInt(e.target.value);
    const maxStock = getStockForSize(selectedSize);

    if (isNaN(newValue) || newValue < 1) {
       setQuantity(1);
       return;
    }

    if (newValue > maxStock) {
      setQuantity(maxStock);
    } else {
      setQuantity(newValue);
    }
  };

  const price = Number(product.price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const hasDiscount = discountPrice !== null && discountPrice > 0;
  
  // Agrupa tamanhos disponíveis para renderizar botões
  // Ordem de exibição desejada
  const ORDERED_SIZES = Object.values(Size);

  return (
    <div className="flex flex-col h-full justify-center">
      
      {/* Breadcrumb / Categoria */}
      <div className="mb-4">
        <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
          {product.category[0]?.name || "Geral"}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1 mb-2">
          {product.name}
        </h1>
      </div>

      {/* Preço */}
      <div className="mb-8">
        {hasDiscount ? (
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountPrice)}
            </span>
            <span className="text-lg text-gray-400 line-through mb-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
            </span>
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold mb-2">
              OFERTA
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
          </span>
        )}
      </div>

      {/* Seletor de Tamanho */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-900">Selecionar Tamanho</span>
          {/* Futuro: Tabela de Medidas */}
          <button className="text-xs text-gray-500 underline hover:text-black">Guia de medidas</button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {ORDERED_SIZES.map((size) => {
             // Só mostra o botão se o produto tiver esse tamanho cadastrado no banco (mesmo que estoque seja 0, para mostrar esgotado)
             const itemExists = product.items.some(i => i.size === size);
             if (!itemExists) return null;

             const stock = getStockForSize(size);
             const isOutOfStock = stock === 0;
             const isSelected = selectedSize === size;

             return (
               <button
                 key={size}
                 onClick={() => !isOutOfStock && handleSizeSelect(size)}
                 disabled={isOutOfStock}
                 className={`
                   w-12 h-12 flex items-center justify-center border rounded-md text-sm font-medium transition-all
                   ${isOutOfStock 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed decoration-slice line-through' 
                      : isSelected
                        ? 'bg-black text-white border-black ring-2 ring-black ring-offset-2'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-gray-900'
                   }
                 `}
               >
                 {size}
               </button>
             )
          })}
        </div>
        {selectedSize && (
            <p className="text-xs text-gray-500 mt-2">
                {getStockForSize(selectedSize)} unidades disponíveis
            </p>
        )}
      </div>

      {/* Seletor de Quantidade & CTA */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Quantidade */}
        <div className="flex items-center border border-gray-300 rounded-md w-max">
          <button 
            onClick={() => handleQuantityChange("decrease")}
            disabled={!selectedSize || quantity <= 1}
            className="p-3 hover:bg-gray-100 disabled:opacity-50 text-gray-600 transition-colors"
          >
            <Minus size={16} />
          </button>
          
          <input 
            type="number"
            min={1}
            max={selectedSize ? getStockForSize(selectedSize) : 1}
            value={quantity}
            onChange={handleManualQuantityChange}
            disabled={!selectedSize}
            className="w-12 text-center font-medium outline-none text-gray-900 
                       appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          
          <button 
            onClick={() => handleQuantityChange("increase")}
            disabled={!selectedSize || (selectedSize ? quantity >= getStockForSize(selectedSize) : true)}
            className="p-3 hover:bg-gray-100 disabled:opacity-50 text-gray-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Botão Comprar */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className="flex-1 bg-[#0D801F] text-white px-8 py-3 rounded-md font-bold text-sm uppercase tracking-wide 
          hover:bg-[#063B0E] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingBag size={20} />
          Adicionar ao carrinho
        </button>
      </div>

      {/* Descrição */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold text-gray-900 mb-2">Sobre o produto</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {product.description}
        </p>
      </div>

    </div>
  );
}