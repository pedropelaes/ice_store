"use server"

import prisma from "../lib/prisma";
import { getAuthenticatedUser } from "../lib/get-user";
import { CardData, DeliveryData } from "../context/CheckoutContext";

export async function saveUserAddress(data: DeliveryData) {
    try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "Usuário não autenticado." };

    const existingAddress = await prisma.address.findFirst({
      where: {
        user_id: user.id,
        zip_code: data.cep,
        number: data.number,
        complement: data.complement || "",
      }
    });

    if (existingAddress) {
      return { success: true, addressId: existingAddress.id };
    }

    const addressCount = await prisma.address.count({
      where: { user_id: user.id }
    });

    const is_default = addressCount === 0;

    const address = await prisma.address.create({
      data: {
        user_id: user.id, 
        zip_code: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement || "",
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        recipient_name: data.recipientName,
        country: "Brasil",
        phone: data.phone,
        is_default: is_default,
      }
    });

    return { success: true, addressId: address.id };
  } catch (error) {
    console.error("Erro ao salvar endereço:", error);
    return { success: false, error: "Não foi possível salvar o endereço." };
  }
}

export async function saveUserCard(
  cardData: CardData, 
  mpToken: string, 
  brand: string    
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "Usuário não autenticado." };

    const last4Digits = cardData.number.slice(-4);

    const existingCard = await prisma.paymentMethod.findFirst({
      where: {
        user_id: user.id,
        last4: last4Digits,
        brand: brand
      }
    });

    if (existingCard) {
      return { success: true, paymentMethodId: existingCard.id };
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        user_id: user.id,
        token: mpToken,
        brand: brand,
        last4: last4Digits,
        provider: "mercadopago"
      }
    });

    return { success: true, paymentMethodId: paymentMethod.id };
  } catch (error) {
    console.error("Erro ao salvar cartão:", error);
    return { success: false, error: "Não foi possível salvar o cartão." };
  }
}