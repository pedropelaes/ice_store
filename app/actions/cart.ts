"use server"

import prisma from "@/app/lib/prisma";
import { Size } from "@/app/generated/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth"; 
import { authOptions } from "../lib/auth"; 
import { success } from "zod";
import { getAuthenticatedUser } from "../lib/get-user";

export async function addToCart(productId: number, size: Size, quantity: number) {
  try {
    const user = await getAuthenticatedUser();
    if(!user) return { success: false, error: "Usuário não autenticado ou não encontrado." }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, discount_price: true }
    });

    if (!product) return { success: false, error: "Produto indisponível." };

    const finalPrice = product.discount_price && Number(product.discount_price) > 0 
      ? product.discount_price 
      : product.price;

    let cart = await prisma.cart.findUnique({
      where: { user_id: user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: user.id }
      });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id: productId,
        size: size
      }
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          product_id: productId,
          size: size,
          quantity: quantity,
          unit_price: finalPrice
        }
      });
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });

    revalidatePath('/cart');
    revalidatePath('/');

    return { success: true, message: "Produto adicionado com sucesso!" };

  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    return { success: false, error: "Ocorreu um erro interno." };
  }
}

export async function updateCartItemQuantity(itemId: number, newQuantity: number) {
  try {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity }
    });

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error);
    return { success: false, error: "Erro ao atualizar item." };
  }
}

export async function removeCartItem(itemId: number) {
  try {
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover item:", error);
    return { success: false, error: "Erro ao remover item." };
  }
}

export async function cleanCart(){
  try{
    const user = await getAuthenticatedUser();
    if(!user) return { success: false, error: "Usuário não autenticado ou não encontrado." }

    let cart = await prisma.cart.findUnique({
      where: { user_id: user.id }
    });
    if(!cart) return { success: true }

    await prisma.cartItem.deleteMany({
      where: { cart_id: cart.id }
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });

    revalidatePath('/cart');
    
    return { success: true, message: "Carrinho esvaziado com sucesso!" };
    
  } catch(error){
    console.error("Erro ao limpar carrinho:", error);
    return { success: false, error: "Erro ao limpar carrinho." }
  }
}