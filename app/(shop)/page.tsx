"use client"

import { useQuery } from "@tanstack/react-query";

async function getCategories() {
    const res = await fetch("/api/products/categories/get-all?limit=4");
    if (!res.ok) throw new Error("Erro ao buscar categorias");
    return res.json();
}

export default function Home() {

  const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

  return (
    <div className="flex min-h-screen justify-center bg-white">
      <main className="flex w-full max-w-7xl flex-col py-12 px-8 text-black">
          
          


          <div className="mb-12">
            <h1 className="text-xl font-bold mb-6">Maiores categorias</h1>
            
            <div className="flex flex-wrap gap-4 justify-center">
                {categories?.map((cat: any) => (
                  <button key={cat.id} className="btn-primary py-2 px-6 text-sm">
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>


      </main>
    </div>
  );
}
