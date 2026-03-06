import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import prisma from "@/app/lib/prisma"
import { signupSchema } from "@/app/lib/validators/user"
import { generateVerificationToken } from "@/app/lib/tokens"
import { sendVerificationEmail } from "@/app/services/mail"


export async function POST(req: Request) {
    try{
        const body = await req.json()
        const parsed = signupSchema.safeParse(body)

        if(!parsed.success){
            return NextResponse.json(
                { errors: parsed.error.flatten()},
                { status: 400 }
            )
        }
        const {name, lastName, cpf: userCpf, birthDate, email, password} = parsed.data
        
        const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { cpf: userCpf }] }
        });

        if (existingUser) {
        const errorField = existingUser.email === email ? "Email" : "CPF";
        return NextResponse.json({ error: `${errorField} já cadastrado.` }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const { user, verificationToken } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: { name, lastName, cpf: userCpf, birthDate, email, passwordHash }
        });

        const newToken = await generateVerificationToken(newUser.email);
        return { user: newUser, verificationToken: newToken };
        });

        const sendEmailSuccess = await sendVerificationEmail(
            user.email, 
            user.name || " ", 
            verificationToken.token
        );

        return NextResponse.json({
            success: "Conta criada! Verifique seu e-mail.",
            emailSended: sendEmailSuccess ? "true" : "false"
        })
    }catch (error) {
        console.error("Erro no signup:", error);
        let errorMessage = "Erro interno no servidor.";
        if (error instanceof Error) errorMessage = error.message;
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
