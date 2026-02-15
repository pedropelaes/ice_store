"use client"

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Size } from "@/app/generated/prisma";

interface FilterSidebarProps {
  categories: { id: number; name: string; _count: { products: number } }[];
}

const SIZES = Object.values(Size);

const PRICE_RANGES = [
  { label: "Até R$ 50", min: 0, max: 50 },
  { label: "R$ 50 - R$ 100", min: 50, max: 100 },
  { label: "R$ 100 - R$ 200", min: 100, max: 200 },
  { label: "Acima de R$ 200", min: 200, max: undefined },
];

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Função genérica para criar links de filtro
  const createFilterLink = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Filtros de preço precisam limpar min/max quando limpam
    if (key === 'price_range') {
        if (!value) {
            params.delete('minPrice');
            params.delete('maxPrice');
        } else {
            const [min, max] = value.split('-');
            if (min) params.set('minPrice', min);
            if (max) params.set('maxPrice', max);
            else params.delete('maxPrice');
        }
        params.delete('price_range'); // Limpa a chave auxiliar visual
    }

    params.delete("page"); // Reseta paginação
    return `/catalog?${params.toString()}`;
  };

  // Verifica filtros ativos
  const activeCategory = searchParams.get("category");
  const activeSize = searchParams.get("size");
  const activeMinPrice = searchParams.get("minPrice");
  const activeMaxPrice = searchParams.get("maxPrice");

  // Helper para identificar o range de preço ativo
  const isPriceActive = (min: number, max?: number) => {
      return activeMinPrice === String(min) && (max ? activeMaxPrice === String(max) : !activeMaxPrice);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-[#999999] rounded-xl p-4 text-white h-fit shadow-md">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-bold text-2xl">Filtros</h2>
        {(activeCategory || activeSize || activeMinPrice) && (
            <Link href="/catalog" className="text-xs text-gray-200 hover:text-white underline">
                Limpar tudo
            </Link>
        )}
      </div>

      <div className="space-y-2">
        {/* GAVETA 1: CATEGORIAS */}
        <FilterDrawer title="Categorias" isOpenDefault={true}>
          <div className="flex flex-col space-y-1">
            <Link 
              href={createFilterLink("category", null)}
              className={`text-sm py-1 px-2 rounded transition-colors ${!activeCategory ? 'bg-white/20 font-bold' : 'hover:bg-white/10 text-gray-100'}`}
            >
              Todas
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={createFilterLink("category", cat.name)}
                className={`text-sm py-1 px-2 rounded flex justify-between items-center transition-colors ${activeCategory === cat.name ? 'bg-white/20 font-bold' : 'hover:bg-white/10 text-gray-100'}`}
              >
                <span>{cat.name}</span>
                <span className="text-xs opacity-70">({cat._count.products})</span>
              </Link>
            ))}
          </div>
        </FilterDrawer>

        {/* GAVETA 2: PREÇO */}
        <FilterDrawer title="Preço">
          <div className="flex flex-col space-y-1">
             <button 
                onClick={() => router.push(createFilterLink("price_range", null))}
                className={`text-left text-sm py-1 px-2 rounded transition-colors ${!activeMinPrice ? 'bg-white/20 font-bold' : 'hover:bg-white/10 text-gray-100'}`}
             >
                Qualquer preço
             </button>
             {PRICE_RANGES.map((range, idx) => (
                 <button
                    key={idx}
                    onClick={() => router.push(createFilterLink("price_range", `${range.min}-${range.max || ''}`))}
                    className={`text-left text-sm py-1 px-2 rounded transition-colors ${isPriceActive(range.min, range.max) ? 'bg-white/20 font-bold' : 'hover:bg-white/10 text-gray-100'}`}
                 >
                    {range.label}
                 </button>
             ))}
          </div>
        </FilterDrawer>

        {/* GAVETA 3: TAMANHO */}
        <FilterDrawer title="Tamanho">
            <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Opção "Todos" para tamanho */}
                <Link
                    href={createFilterLink("size", null)}
                    className={`text-xs border border-white/40 rounded flex items-center justify-center h-8 transition-all ${!activeSize ? 'bg-white text-[#999999] font-bold' : 'hover:bg-white/10 text-white'}`}
                >
                    Todos
                </Link>

                {SIZES.map((size) => (
                    <Link
                        key={size}
                        href={createFilterLink("size", size)}
                        className={`text-xs border border-white/40 rounded flex items-center justify-center h-8 transition-all ${activeSize === size ? 'bg-white text-[#999999] font-bold' : 'hover:bg-white/10 text-white'}`}
                    >
                        {size}
                    </Link>
                ))}
            </div>
        </FilterDrawer>
      </div>
    </aside>
  );
}

function FilterDrawer({ title, children, isOpenDefault = false }: { title: string, children: React.ReactNode, isOpenDefault?: boolean }) {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className="border-b border-white/20 last:border-0 pb-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2 hover:opacity-80 transition-opacity"
            >
                <span className="font-semibold text-sm">{title}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
}