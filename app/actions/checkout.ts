"use server"

import prisma from "../lib/prisma";
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getAuthenticatedUser } from "../lib/get-user";
import { CardData, DeliveryData } from "../context/CheckoutContext";
import { boolean } from "zod";
import { getUserAddresses } from "./adress";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string });
const paymentApi = new Payment(mpClient);

export async function processCheckout(payload: any) {
    try {
        const authUser = await getAuthenticatedUser();
        if(!authUser) return { success: false, error: "Usuário não autenticado ou não encontrado." }

        const user = await prisma.user.findUnique({ where: { email: authUser.email } });
        if (!user) return { success: false, error: "Usuário não encontrado." };

        if (payload.saveAddress && !payload.savedAddressId) {
            await prisma.address.create({
                data: {
                    user_id: user.id,
                    recipient_name: payload.deliveryData.recipientName,
                    phone: payload.deliveryData.phone,
                    zip_code: payload.deliveryData.cep,
                    street: payload.deliveryData.street,
                    number: payload.deliveryData.number,
                    complement: payload.deliveryData.complement || "",
                    neighborhood: payload.deliveryData.neighborhood,
                    city: payload.deliveryData.city,
                    state: payload.deliveryData.state,
                    country: "Brasil",
                    is_default: false
                }
            });
        }

        // SIMULAR GATEWAY DE CARTÃO E SALVAR (Se novo cartão e solicitado salvar)
        if (payload.paymentMethod === 'CREDIT_CARD' && !payload.savedCardId && payload.saveCard) {
            const cardNumber = payload.cardData.number.replace(/\D/g, "");
            const last4 = cardNumber.slice(-4);
            const brand = cardNumber.startsWith('4') ? "Visa" : "Mastercard"; 
            const fakeToken = `tok_${Math.random().toString(36).substring(2, 15)}`; 

            await prisma.paymentMethod.create({
                data: {
                    user_id: user.id,
                    provider: "MercadoPago Sandbox",
                    last4: last4,
                    brand: brand,
                    token: fakeToken
                }
            });
        }

        // CALCULAR TOTAIS E CRIAR O PEDIDO (Order)
        // No mundo real, você deve buscar o carrinho no banco aqui para recalcular os preços
        // e impedir que um usuário mal-intencionado altere o valor do 'subtotal' no front-end.
        const subtotal = 99.99; // Mock: busque do seu banco (Carrinho/Itens)
        let totalFinal = subtotal + payload.shippingFee;

        // Aplica os 5% de desconto do PIX
        if (payload.paymentMethod === 'PIX') {
            totalFinal = totalFinal * 0.95;
        }

        const order = await prisma.order.create({
            data: {
                user_id: user.id,
                status: 'PENDING',
                total_gross: subtotal,
                total_final: totalFinal,
                // O ideal aqui é incluir a criação dos OrderItems atrelados ao carrinho
            }
        });

        // PROCESSAR O PAGAMENTO NO MERCADO PAGO
        if (payload.paymentMethod === 'PIX') {
            // Cria a cobrança PIX real no Mercado Pago
            const paymentResponse = await paymentApi.create({
                body: {
                    transaction_amount: Number(totalFinal.toFixed(2)),
                    description: `Pedido #${order.id} - Loja (Seu Nome)`,
                    payment_method_id: 'pix',
                    payer: {
                        email: user.email,
                        first_name: user.name,
                        last_name: user.lastName,
                        identification: {
                            type: 'CPF',
                            number: payload.billingData.cpf.replace(/\D/g, '') // CPF limpo
                        }
                    }
                }
            });

            // Extrai os dados do PIX da resposta da API
            const qrCodeBase64 = paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64;
            const qrCodeCopiaECola = paymentResponse.point_of_interaction?.transaction_data?.qr_code;

            return { 
                success: true, 
                orderId: order.id, 
                paymentType: 'PIX',
                pixData: { qrCodeBase64, qrCodeCopiaECola } 
            };
        }

        // Se for cartão de crédito (simulado por enquanto)
        return { 
            success: true, 
            orderId: order.id, 
            paymentType: 'CREDIT_CARD' 
        };

    } catch (error) {
        console.error("Erro na Server Action de Checkout:", error);
        return { success: false, error: "Ocorreu um erro ao processar o seu pedido. Tente novamente." };
    }
}

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