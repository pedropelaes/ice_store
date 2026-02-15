"use client"

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";

interface ProductRowProps {
  title: string;
  products: any[]; // Idealmente use a tipagem correta do Prisma ou Product
  catalogLink?: string;
}

export function ProductRow({ title, products, catalogLink }: ProductRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      // Rola metade da largura da tela ou um valor fixo
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {catalogLink && (
          <Link href={catalogLink} className="text-sm text-blue-600 hover:underline font-medium">
            Ver todos
          </Link>
        )}
      </div>

      <div className="relative group flex items-center gap-2">

        <button 
          onClick={() => handleScroll('left')}
          className="hidden md:flex flex-none items-center justify-center w-10 h-10 rounded-full 
          bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
        >
          <ChevronLeft size={24} />
        </button>

        <div 
          ref={rowRef}
          className="flex-1 flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[200px] md:min-w-[240px] max-w-[240px] flex-none">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => handleScroll('right')}
          className="hidden md:flex flex-none items-center justify-center w-10 h-10 rounded-full 
          bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}