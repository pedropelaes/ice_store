"use server"

import prisma from "@/app/lib/prisma";
import { getAuthenticatedUser } from "../lib/get-user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getUserPaymentMethods() {
    try {
        const user = await getAuthenticatedUser();
        
        if (!user) return [];

        const methods = await prisma.paymentMethod.findMany({
            where: { user_id: user.id },
            select: {
                id: true,
                brand: true,
                last4: true,
                provider: true
            },
            orderBy: { id: 'desc' }
        });

        return methods;
    } catch (error) {
        console.error("Erro ao buscar métodos de pagamento:", error);
        return [];
    }
}

export async function deletePaymentMethod(id: number) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) redirect("/");
    try{
        const user = await prisma.user.findUnique({
            where: { email: authUser.email }
        });

        if (!user) {
            return { success: false, error: "Usuário não encontrado no banco." };
        }

        const res = await prisma.paymentMethod.deleteMany({
            where: { 
                id: id,
                user_id: user.id
            }
        });

        if (res.count === 0) {
            return { success: false, error: "Endereço não encontrado ou você não tem permissão." };
        }

        revalidatePath("/profile/cards"); 

        return { success: true };
    }catch(error){
        console.error("Erro ao deletar endereço:", error);
        throw new Error("Erro ao deletar endereço.")
    }
}