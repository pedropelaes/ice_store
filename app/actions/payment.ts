"use server"

import prisma from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 

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