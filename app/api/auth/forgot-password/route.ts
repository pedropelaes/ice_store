import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma"
import { sendResetPasswordEmail } from "@/app/services/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "O e-mail é obrigatório." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Enviaremos um link de recuperação para o e-mail associado a esta conta." },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); 

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: passwordResetToken,
        resetPasswordExpires: passwordResetExpires,
      },
    });

    await sendResetPasswordEmail(email, user.name, resetToken);

    return NextResponse.json(
      { message: "Enviaremos um link de recuperação para o e-mail associado a esta conta." },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("Erro na rota de redefinição de senha:", error);
    
    let errorMessage = "Ocorreu um erro interno ao redefinir a senha.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
    );
}
}