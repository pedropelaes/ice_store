"use server"

import prisma from "@/app/lib/prisma";
import { getAuthenticatedUser } from "../lib/get-user";

export async function getUserAddresses() {
    try {
        const user = await getAuthenticatedUser();
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