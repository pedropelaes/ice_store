import { ProductRow } from "@/app/components/store/ProductRow";
import prisma from "@/app/lib/prisma";
import Link from "next/link";

// Função auxiliar para converter os dados do Prisma para o Front-end
export const serializeProduct = (product: any) => ({
  ...product,
  price: Number(product.price),
  discount_price: product.discount_price ? Number(product.discount_price) : null,
  created_at: product.created_at.toISOString(),
  launched_at: product.launched_at ? product.launched_at.toISOString() : null,
  // Se houver items, garante que sejam objetos simples também
  items: product.items || []
});

async function getHomeData() {
  const [categories, newArrivalsRaw, bestSellersRaw] = await Promise.all([
    prisma.category.findMany({
      take: 6,
      orderBy: { products: {_count: 'desc'}}
    }),

    prisma.product.findMany({
      take: 8,
      orderBy: {launched_at: 'desc'},
      where: {active: 'ACTIVE'},
      include: {
        category: true,
        items: true
      }
    }),

    prisma.product.findMany({
      take: 8,
      where: {active: 'ACTIVE'},
      orderBy: { id: 'asc' }, 
      include: {
        category: true,
        items: true
      }
    })
  ]);

  const newArrivals = newArrivalsRaw.map(serializeProduct);
  const bestSellers = bestSellersRaw.map(serializeProduct);

  return {categories, newArrivals, bestSellers};
}

export default async function Home() {
  const {categories, newArrivals, bestSellers} = await getHomeData();

  return (
    <div className="flex min-h-screen justify-center bg-white">
      <main className="flex w-full max-w-7xl flex-col py-12 px-8 text-black">

        <ProductRow 
          title="Mais vendidos" 
          products={bestSellers} 
          catalogLink="/catalog?sort=bestsellers"
        /> 

        <ProductRow 
          title="Últimos Lançamentos" 
          products={newArrivals} 
          catalogLink="/catalog?sort=newest"
        />


        <section className="text-center">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Navegue por Categoria</h2> 
          <div className="flex flex-wrap gap-4 justify-center">
              {categories?.map((cat: any) => (
                <Link 
                  key={cat.id} 
                  href={`/catalog?category=${cat.name}`}
                  className="btn-primary py-2 px-6 text-sm" 
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        </section>

      </main>
    </div>
  );
}
