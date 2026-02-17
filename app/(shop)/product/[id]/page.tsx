import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/app/components/store/product/ProductDetails";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "@/app/components/store/ProductCard";
import { serializeProduct } from "@/app/(shop)/page";

// Função para buscar dados
async function getProduct(id: string) {
  // Convertemos para Int, pois seu schema usa Int no ID
  const productId = parseInt(id);
  
  if (isNaN(productId)) return null;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      items: true // Importante: traz o estoque
    }
  });

  if (!product) return null;

  // Serialização do Decimal (igual fizemos antes)
  return {
    ...product,
    price: Number(product.price),
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    items: product.items, // Já vem no formato certo
    category: product.category
  };
}

async function getRelatedProducts(currentProductId: number, categoryIds: number[]){
  if(categoryIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: {
      active: 'ACTIVE',
      id: { not: currentProductId },
      category: {
        some: {
          id: {
            in: categoryIds // produtos que compartilham pelo menos 1 categoria
          }
        }
      }
    },
    take: 4,
    orderBy: { launched_at: 'desc' },
    include: {
      category: true,
      items: true
    }
  });

  return products.map(serializeProduct);
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const categoryIds = product.category.map((c: any) => c.id);
  const relatedProducts = await getRelatedProducts(product.id, categoryIds);

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* Botão Voltar */}
        <div className="mb-6">
           <Link href="/catalog" className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors">
              <ChevronLeft size={16} className="mr-1" /> Voltar para a loja
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* COLUNA ESQUERDA: Imagem */}
          <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
             {product.image_url ? (
               <img 
                 src={product.image_url} 
                 alt={product.name} 
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="flex items-center justify-center h-full text-gray-400">
                 Sem imagem
               </div>
             )}
          </div>

          {/* COLUNA DIREITA: Detalhes Interativos */}
          <div>
             <ProductDetails product={product as any} /> 
             {/* 'as any' temporário para bypassar checagem estrita de Decimal vs number na tipagem rápida, 
                 mas o objeto já foi serializado no getProduct */}
          </div>

        </div>
        
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">Você também pode gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                    <ProductCard key={related.id} product={related} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}