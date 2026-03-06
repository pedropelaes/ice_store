import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "O link de recuperação é inválido ou já expirou." },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: {
        id: user.id, 
      },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null, 
      },
    });

    return NextResponse.json(
      { message: "Senha redefinida com sucesso." },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("Erro na rota de redefinição de senha:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao redefinir a senha." },
      { status: 500 }
    );
  }
}