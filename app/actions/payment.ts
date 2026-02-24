"use server"

import prisma from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import { randomUUID } from "crypto";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { Size } from "../generated/prisma";
import { calculateShipping } from "./shipping";

export async function getUserPaymentMethods() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return [];

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
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
    token: string;
    installments: number;
    paymentMethodId: string;
    payer: {
        firstName: string;
        lastName: string;
        cpf: string;
    };
    orderId: string;
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

export async function processCardPayment({ token, installments, paymentMethodId, payer, orderId }: CardPaymentParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) throw new Error("Usuário não autenticado.");

        const idempotencyKey = randomUUID();
        const payment = getPaymentInstance();

        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) }
        });

        if (!order) {
            throw new Error("Pedido não encontrado no sistema.");
        }

        const response = await payment.create({
            body: {
                transaction_amount: Number(order.total_final),
                token: token,
                description: `Pedido #${orderId} - Ice Store`,
                installments: installments,
                payment_method_id: paymentMethodId,
                payer: {
                    email: session.user.email, // Seguro, vem da sessão
                    first_name: payer.firstName, // Pode ser do titular do cartão
                    last_name: payer.lastName,
                    identification: {
                        type: 'CPF',
                        number: payer.cpf.replace(/\D/g, '') 
                    }
                },
                external_reference: orderId,
                capture: true, 
            },
            requestOptions: {
                idempotencyKey: idempotencyKey
            }
        });

        return {
            success: true, 
            paymentId: response.id, 
            status: response.status,               
            statusDetail: response.status_detail,
        };

    } catch (error) {
        console.error("[MP_CARD_ERROR] Falha ao processar cartão:", error);
        return { success: false, error: "Ocorreu um erro ao processar o pagamento com a operadora." };
    }
}

interface CheckoutItem {
    productId: number; // No seu schema é Int
    size: Size;
    quantity: number;
}

export async function createOrderAndReserveStock(data: {
    cartItems: CheckoutItem[],
    paymentMethod: 'PIX' | 'CREDIT_CARD',
    payer: any, 
    cep: string,
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) throw new Error("Usuário não autenticado.");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) throw new Error("Usuário não encontrado.");

        // 2. INICIA A TRANSAÇÃO SEGURA NO BANCO
        const result = await prisma.$transaction(async (tx) => {
            let backendSubtotal = 0;
            const orderItemsData = []; // Para criar os itens do pedido de uma vez

            // 2.1 Checar estoque por TAMANHO e calcular valores reais
            for (const item of data.cartItems) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) throw new Error(`Produto não encontrado.`);

                // Busca a variação de tamanho exata baseada na restrição @@unique do schema
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

                // Remove do estoque da variação (ProductItem)
                await tx.productItem.update({
                    where: { id: productItem.id },
                    data: { quantity: productItem.quantity - item.quantity }
                });

                // Remove do estoque total do produto (Product)
                await tx.product.update({
                    where: { id: product.id },
                    data: { totalStock: product.totalStock - item.quantity }
                });

                // Usa o preço com desconto se existir, se não usa o preço normal
                const unitPrice = Number(product.discount_price || product.price);
                backendSubtotal += unitPrice * item.quantity;

                // Prepara o objeto para a tabela OrderItem
                orderItemsData.push({
                    product_id: product.id,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    size: item.size
                });
            }

            // 2.2 Calcular Gross e Final (conforme schema)
            const validShippingFee = await calculateShipping(data.cep);
            if(validShippingFee.price === undefined){
                throw new Error("Falha ao calcular o total");
            }
            const totalGross = backendSubtotal + validShippingFee.price;
            let totalFinal = totalGross;

            if (data.paymentMethod === 'PIX') {
                totalFinal -= backendSubtotal * 0.05; // 5% de desconto apenas sobre os produtos
            }

            // 2.3 Criar o pedido (Order) com os itens (OrderItem)
            const order = await tx.order.create({
                data: {
                    user_id: user.id,
                    total_gross: totalGross,
                    total_final: totalFinal,
                    status: 'PENDING',
                    orderItems: {
                        create: orderItemsData
                    }
                }
            });

            return { order, totalFinal };
        });

        const { order, totalFinal } = result;

        // 3. SE FOR PIX, GERA O QR CODE AGORA
        if (data.paymentMethod === 'PIX') {
            const pixResult = await processPixPayment({
                amount: totalFinal,
                payer: {...data.payer, email: user.email},
                orderId: order.id.toString(), // Mercado Pago exige string
            });

            if (!pixResult) {
                throw new Error("Falha ao gerar o QR Code do banco.");
            }

            return { success: true, orderId: order.id, pixData: pixResult };
        }

        // Se for cartão, retorna o ID do pedido para o frontend gerar o token e processar depois
        return { success: true, orderId: order.id, amount: totalFinal };

    } catch (error: any) {
        console.error("Erro na criação do pedido:", error);
        return { success: false, error: error.message || "Erro ao processar o pedido." };
    }
}