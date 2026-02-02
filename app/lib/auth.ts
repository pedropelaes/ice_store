import Credentials from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"
import prisma from "@/app/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"
import { PrismaAdapter } from "@auth/prisma-adapter"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authOptions: NextAuthOptions = {
  //adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/login',
    error: "/auth/login"
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if(!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        const user = await prisma.user.findUnique({
            where: { email: email }
        })

        if(!user || !user.passwordHash) return null;

        if(!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");

        const valid = await bcrypt.compare(
            password,
            user.passwordHash
        )

        if(!valid) return null;

        return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "USER",
        }
      }
    })
  ],
  callbacks: {
    async jwt({token, user}){
      if (user){
        token.id = user.id;
        token.role = user.role;
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}