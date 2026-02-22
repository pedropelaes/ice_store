"use server"

import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function getUserAddresses() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return [];

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return [];

        // Busca todos os endereços do usuário, trazendo o padrão primeiro
        const addresses = await prisma.address.findMany({
            where: { user_id: user.id },
            orderBy: { is_default: 'desc' }
        });

        return addresses;
    } catch (error) {
        console.error("Erro ao buscar endereços:", error);
        return [];
    }
}