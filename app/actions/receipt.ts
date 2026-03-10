"use server"

import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function getOrderReceiptToken(orderId: number) {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
        throw new Error("Não autorizado");
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { client: true }
    });

    if (!order || order.client.email !== session.user.email) {
        throw new Error("Pedido não encontrado ou acesso negado.");
    }

    return { success: true, token: order.receipt_token }; 
}