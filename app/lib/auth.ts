import Credentials from "next-auth/providers/credentials"
import prisma from "@/app/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions = {
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
  ]
}