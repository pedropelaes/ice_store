import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { sendReceiptEmail } from "@/app/services/mail";
import { MercadoPagoConfig, Payment } from "mercadopago"; // Importe a SDK do backend

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const type = body.type || body.topic;

    if (type === "payment") {
      const paymentId = body.data.id;
      
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string });
      const payment = new Payment(client);
      
      const paymentInfo = await payment.get({ id: paymentId });

      if (paymentInfo.status === "approved") {
        
        const orderId = paymentInfo.external_reference;

        if (orderId) {
            const order = await prisma.order.update({
                where: { id: Number(orderId) },
                data: { status: 'PAID' },
                include: { client: true }
            });

            if (order.client) {
                await sendReceiptEmail(
                    order.client.email, 
                    order.client.name, 
                    order.id
                );
            }
        }
      }
    }

    return new NextResponse("Webhook processado com sucesso", { status: 200 });

  } catch (error) {
    console.error("Erro no Webhook:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}