import { NextResponse } from "next/server"
import prisma from "@/app/lib/prisma"
import { generateVerificationToken } from "@/app/lib/tokens"
import { sendVerificationEmail } from "@/app/services/mail"

export async function POST(req: Request) {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Gera um NOVO token (o antigo será invalidado pela sua lógica de tokens)
    const verificationToken = await generateVerificationToken(user.email);

    const emailSuccess = await sendVerificationEmail(
        user.email, 
        user.name || " ", 
        verificationToken.token
    );

    if (emailSuccess) {
        return NextResponse.json({ success: true })
    } else {
        return NextResponse.json({ error: "Failed to send" }, { status: 500 })
    }
}