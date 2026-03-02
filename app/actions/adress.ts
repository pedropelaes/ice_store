"use server"

import prisma from "@/app/lib/prisma";
import { getAuthenticatedUser } from "../lib/get-user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export async function deleteAddress(id: number) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) redirect("/");
    try{
        const user = await prisma.user.findUnique({
            where: { email: authUser.email }
        });

        if (!user) {
            return { success: false, error: "Usuário não encontrado no banco." };
        }

        const res = await prisma.address.deleteMany({
            where: { 
                id: id,
                user_id: user.id
            }
        });

        if (res.count === 0) {
            return { success: false, error: "Endereço não encontrado ou você não tem permissão." };
        }

        revalidatePath("/profile/addresses"); 

        return { success: true };
    }catch(error){
        console.error("Erro ao deletar endereço:", error);
        throw new Error("Erro ao deletar endereço.")
    }
}