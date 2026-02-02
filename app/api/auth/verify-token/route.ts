import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
    try{
        const { token } = await req.json();

        const existingToken = await prisma.verificationToken.findUnique({
            where: { token },
        })

        if(!existingToken){
            return NextResponse.json({ error: "Invalid or unexisting token." }, { status: 400 });
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if(hasExpired){
            return NextResponse.json({ error: "Expired token." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: existingToken.email },
        })

        if(!existingUser){
            return NextResponse.json({ error: "Associated e-mail doesn't exist." }, { status: 404 });
        }

        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                emailVerified: new Date(),
                email: existingToken.email
            },
        });

        await prisma.verificationToken.delete({
            where: { id: existingToken.id },
        });

        return NextResponse.json({ success: "E-mail verificado com sucesso!" }, { status: 200 });

    }catch(error){
        return NextResponse.json({error: "Internal server error."}, {status: 500});
    }
}