"use server"

import prisma from "@/app/lib/prisma"; 
import { getAuthenticatedUser } from "@/app/lib/get-user";
import { revalidatePath } from "next/cache";
import { updateProfileSchema } from "../lib/validators/user";

interface UpdateDataParams {
  name: string;
  lastName: string;
  birthDate: string;
}

export async function updateUserData(data: UpdateDataParams) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return { success: false, error: "Usuário não autenticado." };

    const parsed = updateProfileSchema.safeParse(data);

    if (!parsed.success) {
      // Pega a primeira mensagem de erro do Zod para mostrar no Toast do front-end
      const firstError = parsed.error.issues[0]?.message || "Dados inválidos.";
      return { success: false, error: firstError };
    }

    await prisma.user.update({
      where: { email: authUser.email },
      data: {
        name: parsed.data.name,
        lastName: parsed.data.lastName,
        birthDate: parsed.data.birthDate,
      }
    });

    revalidatePath("/profile/data");

    return { success: true };

  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    return { success: false, error: "Falha interna ao salvar as alterações." };
  }
}