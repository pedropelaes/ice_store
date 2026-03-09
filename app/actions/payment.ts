"use server"

import prisma from "../lib/prisma";
import { randomUUID } from "crypto";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { Size } from "../generated/prisma";
import { calculateShipping } from "./shipping";
import { sendReceiptEmail } from "../services/mail";
import { DeliveryData } from "../context/CheckoutContext";
import { getAuthenticatedUser } from "../lib/get-user";
import { IPaymentMethod } from "../generated/prisma";

export async function getUserPaymentMethods() {
    try {
        const authUser = await getAuthenticatedUser();
        if(!authUser) return { success: false, error: "Usuário não autenticado ou não encontrado." }

        const user = await prisma.user.findUnique({
            where: { email: authUser.email }
        });

        if (!user) return [];

        const methods = await prisma.paymentMethod.findMany({
            where: { user_id: user.id },
            orderBy: { id: 'desc' } 
        });

        return methods;
    } catch (error) {
        console.error("Erro ao buscar métodos de pagamento:", error);
        return [];
    }
}

function getPaymentInstance() {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não definido.");
    
    const client = new MercadoPagoConfig({ 
        accessToken: token,
        options: { timeout: 10000 } 
    });
    return new Payment(client);
}

interface PayerData {
    email: string;
    firstName: string;
    lastName: string;
    cpf: string;
}

interface PixPaymentParams {
    amount: number;
    payer: PayerData;
    orderId: string;
}

interface CardPaymentParams {
    token?: string;
    installments: number;
    paymentMethodId?: string;
    issuerId?: string;
    payer: {
        firstName: string;
        lastName: string;
        cpf: string;
    };
    orderId: string;
    savedCardId?: number;
    last4?: string;
}

export async function processPixPayment({ amount, payer, orderId }: PixPaymentParams) {
    try {
        const idempotencyKey = randomUUID();
        const payment = getPaymentInstance();

        const response = await payment.create({
            body: {
                transaction_amount: Number(amount.toFixed(2)),
                description: `Pedido #${orderId} - Ice Store`,
                payment_method_id: 'pix',
                payer: {
                    email: payer.email,
                    first_name: payer.firstName,
                    last_name: payer.lastName,
                    identification: {
                        type: 'CPF',
                        number: payer.cpf.replace(/\D/g, '')
                    }
                },
                external_reference: orderId, 
            },
            requestOptions: {
                idempotencyKey: idempotencyKey // Evita que um retry gere dois PIX
            }
        });

        const transactionData = response.point_of_interaction?.transaction_data;

        if (!transactionData?.qr_code || !transactionData?.qr_code_base64) {
            throw new Error("Dados do QR Code ausentes na resposta do gateway.");
        }

        return { 
            paymentId: response.id,
            qrCode: transactionData.qr_code, 
            qrCodeBase64: transactionData.qr_code_base64, 
        };

    } catch (error) {
        console.error("[MP_PIX_ERROR] Falha ao gerar PIX:", error);
        throw new Error("Não foi possível gerar o código PIX. Tente novamente.");
    }
}

export async function processCardPayment({ token, installments, paymentMethodId, issuerId, payer, orderId, savedCardId, last4 }: CardPaymentParams) {
    try {
        const authUser = await getAuthenticatedUser();
        if(!authUser) return { success: false, error: "Usuário não autenticado ou não encontrado." }

        const idempotencyKey = randomUUID();
        const payment = getPaymentInstance();

        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) }
        });

        if (!order) {
            throw new Error("Pedido não encontrado no sistema.");
        }

        if (savedCardId) {
            return {
                success: false, 
                error: "⚠️ Ambiente de Demonstração: O uso de cartões salvos requer validação avançada. Insira um cartão novo."
            };
        }

        // Correção de Tipo: Garantindo que o Decimal do Prisma vire um número válido
        const amountFinal = Number(order.total_final.toString());
        //const finalIssuerId = issuerId ? Number(issuerId) : undefined;
        const requestBody = {
            transaction_amount: Number(amountFinal.toFixed(2)),
            token: token,
            description: `Pedido #${orderId} - Ice Store`,
            installments: Number(installments),
            payment_method_id: paymentMethodId,
            //issuer_id: finalIssuerId,
            payer: {
                email: "test_user_82347@test.com",
                first_name: payer.firstName,
                last_name: payer.lastName,
                identification: {
                    type: 'CPF',
                    number: '12345678909'
                }
            },
            external_reference: orderId.toString(),
            capture: true, 
        };

        console.log("\n=== 🟡 PAYLOAD ENVIADO PARA O MERCADO PAGO ===");
        console.log(JSON.stringify(requestBody, null, 2));

        const response = await payment.create({
            body: requestBody,
            requestOptions: {
                idempotencyKey: idempotencyKey
            }
        });

        console.log("\n=== 🟢 SUCESSO! RESPOSTA DO MERCADO PAGO ===");
        console.log("Status:", response.status, "| Detalhe:", response.status_detail);

        if(response.status === 'approved'){
            await prisma.orderPayment.create({
              data: {
                    orderId: Number(orderId),
                    method: IPaymentMethod.CREDIT,
                    installments: Number(installments),
                    card_brand: paymentMethodId,
                    card_last4: last4 
                }  
            })
            await changeOrderStatus(true, Number(orderId))
        }

        return {
            success: true, 
            paymentId: response.id, 
            status: response.status,               
            statusDetail: response.status_detail,
        };

    } catch (error: any) {
        // A MÁGICA DO DEBUG ESTÁ AQUI
        console.error("\n=== 🔴 ERRO FATAL AO PROCESSAR CARTÃO ===");
        console.error("Mensagem geral:", error.message);
        console.error("Causa raiz (Detalhes da API):", JSON.stringify(error.cause || error, null, 2));
        
        // Retornamos a mensagem de erro do MP para o Front-end mostrar na tela vermelha!
        return { 
            success: false, 
            error: `Erro na API do MP: ${error.message}. Olhe o terminal do backend.` 
        };
    }
}

interface CheckoutItem {
    productId: number;
    size: Size;
    quantity: number;
}

export async function createOrderAndReserveStock(data: {
    cartItems: CheckoutItem[],
    paymentMethod: 'PIX' | 'CREDIT_CARD',
    payer: any, 
    addressData: DeliveryData
}) {
    try {
        const authUser = await getAuthenticatedUser();
        if(!authUser) return { success: false, error: "Usuário não autenticado ou não encontrado." }

        const user = await prisma.user.findUnique({
            where: { email: authUser.email }
        });

        if (!user) throw new Error("Usuário não encontrado.");

        // 2. INICIA A TRANSAÇÃO SEGURA NO BANCO
        const result = await prisma.$transaction(async (tx) => {
            let backendSubtotal = 0;
            const orderItemsData = []; 

            for (const item of data.cartItems) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) throw new Error(`Produto não encontrado.`);

                const productItem = await tx.productItem.findUnique({
                    where: {
                        product_id_size: {
                            product_id: item.productId,
                            size: item.size
                        }
                    }
                });

                if (!productItem || productItem.quantity < item.quantity) {
                    throw new Error(`Estoque insuficiente para o produto: ${product.name} (Tamanho ${item.size})`);
                }

                await tx.productItem.update({
                    where: { id: productItem.id },
                    data: { quantity: productItem.quantity - item.quantity }
                });

                await tx.product.update({
                    where: { id: product.id },
                    data: { totalStock: product.totalStock - item.quantity }
                });

                const unitPrice = Number(product.discount_price || product.price);
                backendSubtotal += unitPrice * item.quantity;

                orderItemsData.push({
                    product_id: product.id,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    size: item.size
                });
            }

            const validShippingFee = await calculateShipping(data.addressData.cep);
            if(validShippingFee.price === undefined){
                throw new Error("Falha ao calcular o total");
            }
            const totalGross = backendSubtotal + validShippingFee.price;
            let totalFinal = totalGross;

            if (data.paymentMethod === 'PIX') {
                totalFinal -= backendSubtotal * 0.05; 
            }

            // Removido o 'any' para garantir segurança de tipos
            const order = await tx.order.create({ 
                data: {
                    user_id: user.id,
                    total_gross: totalGross,
                    total_final: totalFinal,
                    status: 'PENDING',
                    shipping: {
                        create: {
                            recipient: data.addressData.recipientName,
                            street: data.addressData.street,
                            number: data.addressData.number,
                            complement: data.addressData.complement,
                            neighborhood: data.addressData.neighborhood,
                            city: data.addressData.city,
                            state: data.addressData.state,
                            zipCode: data.addressData.cep,
                        }
                    },
                    orderItems: {
                        create: orderItemsData
                    },
                    ...(data.paymentMethod === 'PIX' && {
                        payment: {
                            create: { method: IPaymentMethod.PIX }
                        }
                    })
                }
            });

            return { order, totalFinal };
        });

        const { order, totalFinal } = result;

        const qstashBaseUrl = process.env.NODE_ENV === 'development' 
            ? "http://localhost:8080/v2/publish" 
            : "https://qstash.upstash.io/v2/publish";

        const endpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/expire`;

        fetch(`${qstashBaseUrl}/${endpoint}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.QSTASH_TOKEN}`,
                "Content-Type": "application/json",
                "Upstash-Delay": "15m" 
            },
            body: JSON.stringify({ orderId: order.id }),
        }).catch(err => console.error("Erro ao agendar expiração no QStash:", err));

        if (data.paymentMethod === 'PIX') {
            const pixResult = await processPixPayment({
                amount: totalFinal,
                payer: {...data.payer, email: user.email},
                orderId: order.id.toString(),
            });

            if (!pixResult) {
                throw new Error("Falha ao gerar o QR Code do banco.");
            }

            return { 
                success: true, 
                orderId: order.id, 
                receiptToken: order.receipt_token,
                pixData: pixResult 
            };
        }

        return { 
            success: true, 
            orderId: order.id, 
            receiptToken: order.receipt_token,
            amount: totalFinal, 
            orderedAt: order.orderedAt 
        };

    } catch (error: unknown) {
        console.error("Erro na criação do pedido:", error);
        const message = error instanceof Error ? error.message : "Erro ao processar o pedido.";
        return { success: false, error: message };
    }
}

export async function changeOrderStatus(approved: boolean, orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, orderItems: true } 
  });

  if (!order || order.status !== 'PENDING') return;

  if (approved) {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: { client: true }
    });

    if (updatedOrder.client) {
      sendReceiptEmail(updatedOrder.client.email, updatedOrder.client.name, updatedOrder.receipt_token).catch(console.error);
    }
    return updatedOrder;
  } else {
    return await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        // Devolve ao estoque da variação (Size)
        await tx.productItem.update({
          where: {
            product_id_size: {
              product_id: item.product_id,
              size: item.size
            }
          },
          data: { quantity: { increment: item.quantity } }
        });

        // Devolve ao estoque total do produto
        await tx.product.update({
          where: { id: item.product_id },
          data: { totalStock: { increment: item.quantity } }
        });
      }

      return await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELED' }
      });
    });
  }
}

export async function verifyPaymentStatus(paymentId: number, orderId: number) {
    try {
        const payment = getPaymentInstance();
        
        const paymentInfo = await payment.get({ id: paymentId });

        if (paymentInfo.status === 'approved') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' }
            });
            return { approved: true };
        }
        
        return { approved: false };
    } catch (error) {
        console.error("Erro ao verificar status do PIX:", error);
        return { approved: false };
    }
}


