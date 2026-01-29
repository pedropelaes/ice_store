import Credentials from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"
import prisma from "@/app/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if(!credentials?.email || !credentials?.password)
            return null

        const user = await prisma.user.findUnique({
            where: { email: credentials.email }
        })

        if(!user) return null

        const valid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
        )

        if(!valid) return null

        return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            
            role: user.role,
            emailVerified: user.emailVerified
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
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
  pages: {
    signIn: '/login',
  }
}