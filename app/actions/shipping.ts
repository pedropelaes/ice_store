"use server"

import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export async function calculateShipping(destinationCep: string) {
  try {
    const cleanCep = destinationCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      return { success: false, error: "CEP inválido." };
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, error: "Usuário não encontrado." };

    const cart = await prisma.cart.findUnique({
      where: { user_id: user.id },
      include: {
        cartItems: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.cartItems.length === 0) {
      return { success: false, error: "Carrinho vazio." };
    }

    const productsPayload = cart.cartItems.map(item => {
      // Fallback: Se o admin esquecer de cadastrar as dimensões, 
      // usamos um tamanho padrão mínimo aceito pelos Correios (16x11x2 cm, 300g)
      const weight = item.product.weight ? Number(item.product.weight) : 0.3;
      const length = item.product.length ? Number(item.product.length) : 16;
      const width = item.product.width ? Number(item.product.width) : 11;
      const height = item.product.height ? Number(item.product.height) : 2;
      const price = Number(item.unit_price);

      return {
        id: item.product.id.toString(),
        width: width,
        height: height,
        length: length,
        weight: weight,
        insurance_value: price, // Valor para o seguro da carga
        quantity: item.quantity
      };
    });

    const originCep = process.env.STORE_ORIGIN_CEP || "01001000";
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const email = process.env.EMAIL;

    const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': `ICE Store (${email})` // Eles pedem para identificar sua aplicação
      },
      body: JSON.stringify({
        from: { postal_code: originCep },
        to: { postal_code: cleanCep },
        products: productsPayload
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Melhor Envio:", data);
      return { success: false, error: "Erro ao consultar transportadora." };
    }

    // 4. O Melhor Envio retorna um array com várias transportadoras (Correios PAC, Sedex, Jadlog, etc).
    const validOptions = data.filter((option: any) => !option.error);
    
    if (validOptions.length === 0) {
        return { success: false, error: "Nenhuma transportadora atende este CEP." };
    }

    const sortedOptions = validOptions.sort((a: any, b: any) => Number(a.price) - Number(b.price));
    const cheapestOption = sortedOptions[0];

    const allOptions = sortedOptions.map((opt: any) => ({
        id: opt.id,
        company: opt.company.name, 
        method: opt.name,          
        price: Number(opt.price),
        delivery_time: opt.delivery_time
    }));

    return { 
        success: true, 
        price: Number(cheapestOption.price),
        delivery_time: cheapestOption.delivery_time, 
        company: cheapestOption.company.name,
        options: allOptions 
    };

  } catch (error) {
    console.error("Erro na action de frete:", error);
    return { success: false, error: "Erro interno ao calcular frete." };
  }
}