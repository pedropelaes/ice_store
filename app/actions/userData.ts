"use server"

import prisma from "@/app/lib/prisma"; 
import { getAuthenticatedUser } from "@/app/lib/get-user";
import { revalidatePath } from "next/cache";

interface UpdateDataParams {
  name: string;
  lastName: string;
  birthDate: string;
}

export async function updateUserData(data: UpdateDataParams) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return { success: false, error: "Usuário não autenticado." };

    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: "Nome muito curto ou inválido." };
    }
    if (!data.lastName || data.lastName.trim().length < 2) {
      return { success: false, error: "Sobrenome muito curto ou inválido." };
    }

    const parsedDate = new Date(data.birthDate);
    if (isNaN(parsedDate.getTime())) {
      return { success: false, error: "Data de nascimento inválida." };
    }

    await prisma.user.update({
      where: { email: authUser.email },
      data: {
        name: data.name.trim(),
        lastName: data.lastName.trim(),
        birthDate: parsedDate,
      }
    });

    revalidatePath("/profile/data");

    return { success: true };

  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    return { success: false, error: "Falha interna ao salvar as alterações." };
  }
}