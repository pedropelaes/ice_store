import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import prisma from "@/app/lib/prisma"
import { signupSchema } from "@/app/lib/validators/user"


export async function POST(req: Request) {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)

    if(!parsed.success){
        return NextResponse.json(
            { errors: parsed.error.flatten()},
            { status: 400 }
        )
    }
    const {name, lastName, cpf, birthDate, email, password} = parsed.data
    
    const existingEmail = await prisma.user.findUnique({
        where: {email}
    })
    const existingCPF = await prisma.user.findUnique({
        where: {cpf}
    })

    if(existingEmail){
        return NextResponse.json(
            { error: "Email exists" },
            { status: 400 }
        )
    }
    if(existingCPF){
        return NextResponse.json(
            { error: "CPF exists" },
            { status: 400 }
        )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            lastName,
            cpf,
            birthDate,
            email,
            passwordHash
        }
    })

    return NextResponse.json({
        id: user.id,
        email: user.email,
        cpf: user.cpf,
        birthDate: user.birthDate
    })
}
