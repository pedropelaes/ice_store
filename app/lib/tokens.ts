import { v4 } from "uuid";
import prisma from "@/app/lib/prisma"

export const generateVerificationToken = async (email: string) => {
    const token = v4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // Tempo de 1 hora para expirar

    const existingToken = await prisma.verificationToken.findFirst({
        where: { email }
    });

    const verificationToken = await prisma.verificationToken.create({
        data: {
        email,
        token,
        expires,
        }
    });

    return verificationToken;
}