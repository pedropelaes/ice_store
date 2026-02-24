import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { CartItemCard } from "@/app/components/store/cart/CartItem";
import { OrderSummary } from "@/app/components/store/cart/OrderSummary";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export async function getCartData(userId: number) {
  const cart = await prisma.cart.findUnique({
    where: { user_id: userId },
    include: {
      cartItems: {
        include: {
          product: {
            select: { id: true, name: true, image_url: true, active: true,items: true }
          }
        },
        orderBy: { id: 'asc' }
      }
    }
  });

  if (!cart) return [];

  return cart.cartItems.map(item => {
    const productItem = item.product.items.find(i => i.size === item.size);
    const maxStock = productItem?.quantity || 0;
    const status = item.product.active;

    return {
      ...item,
      unit_price: Number(item.unit_price),
      maxStock: maxStock,
      active: status,
    };
  });
}

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/auth/login?callbackUrl=/cart');
  }

  // Busca ID do usuário logado
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  const cartItems = user ? await getCartData(user.id) : [];

  // Calcula subtotal base
  const subtotal = cartItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

  const hasInvalidItems = cartItems.some(
    item => item.maxStock === 0 || item.active !== "ACTIVE" || item.quantity > item.maxStock
  );

  const isValidCart = !hasInvalidItems && cartItems.length > 0;

  return (
    <div className="bg-white min-h-screen text-black pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho</h1>

        {cartItems.length === 0 ? (
          // ESTADO VAZIO
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-gray-100">
            <ShoppingBag size={64} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Sua sacola está vazia</h2>
            <p className="text-gray-500 mb-6">Navegue pelas categorias e encontre seus produtos favoritos.</p>
            <Link href="/catalog" className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
              Continuar Comprando
            </Link>
          </div>
        ) : (
          // LAYOUT COM ITENS
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            
            {/* Lista de Itens (Esquerda) */}
            <div className="flex-1">
              <div className="border-t border-gray-200 pt-2">
                {cartItems.map((item) => (
                  <CartItemCard 
                    key={item.id} 
                    item={item} 
                  />
                ))}
              </div>
            </div>

            {/* Resumo do Pedido (Direita) */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <OrderSummary subtotal={subtotal} isValidCart={isValidCart}/>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}