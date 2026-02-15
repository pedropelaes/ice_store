"use client"
import { useRouter, useSearchParams } from "next/navigation";

export function SortDropdown() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "newest";

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        params.delete("page"); 
        router.push(`/catalog?${params.toString()}`);
    };

    return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-500 hidden sm:block">
        Ordenar por:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="border border-gray-300 rounded-md text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-800"
      >
        <option value="newest">Lançamentos</option>
        <option value="price_asc">Menor Preço</option>
        <option value="price_desc">Maior Preço</option>
        <option value="name_asc">Nome (A-Z)</option>
      </select>
    </div>
  );
}