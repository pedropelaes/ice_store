"use server"
import bcrypt from "bcrypt"
import prisma from "../lib/prisma";
import { getAuthenticatedUser } from "../lib/get-user";


export async function deleteUserAccount(password: string) {
  try {
    // 1. Trava de segurança: usuário logado
    const authUser = await getAuthenticatedUser();
    if (!authUser) return { success: false, error: "Não autorizado." };
    
    // 2. Busca o usuário no banco para checar a senha atual
    const user = await prisma.user.findUnique({
        where: { email: authUser.email }
    });

    if (!user || !user.passwordHash) {
        return { success: false, error: "Usuário não encontrado." };
    }

    const userId = user.id;
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        return { success: false, error: "A senha informada está incorreta." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.deleteMany({ where: { user_id: userId } });
      await tx.paymentMethod.deleteMany({ where: { user_id: userId } });
      await tx.cartItem.deleteMany({ where: { cart: { user_id: userId } } });
      await tx.cart.deleteMany({ where: { user_id: userId } });
      
      const randomHash = crypto.randomUUID(); 
      
      await tx.user.update({
        where: { id: userId },
        data: {
          name: "Conta Excluída",
          email: `deleted_${randomHash}@icestore.com`,
          passwordHash: "",
          cpf: "", 
          active: false,
        }
      });
    });

    return { success: true };

  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return { success: false, error: "Falha interna ao tentar excluir a conta." };
  }
}