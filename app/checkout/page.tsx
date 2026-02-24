import { CheckoutProvider, useCheckout } from "@/app/context/CheckoutContext";
import { Lock } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import prisma from "../lib/prisma";
import { getCartData } from "../(shop)/cart/page";
import CheckoutClient from "./CheckoutClient";


export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/auth/login?callbackUrl=/checkout');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  const cartItems = user ? await getCartData(user.id) : [];

  // Proteção: não deixa acessar o checkout sem itens
  if (cartItems.length === 0) {
    redirect('/cart');
  }

  return (
    // Chama o componente de cliente injetando os dados reais
    <CheckoutClient initialCartItems={cartItems} />
  );
}