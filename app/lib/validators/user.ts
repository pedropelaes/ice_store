import { z } from "zod"
import { cpf as cpfValidator } from "cpf-cnpj-validator"

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name too short")
    .transform(v => v.trim()),

  lastName: z
    .string()
    .min(1, "Last name required")
    .transform(v => v.trim()),

  email: z
    .email("Invalid email")
    .transform(v => v.toLowerCase().trim()),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine(v => /[A-Za-z]/.test(v), "Password must contain at least one letter"),

  cpf: z
    .string()
    .transform(v => v.replace(/\D/g, "")) // remove máscara
    .refine(v => cpfValidator.isValid(v), {
      message: "Invalid CPF"
    }),

  birthDate: z
  .string()
  .transform(val => new Date(val))
  .refine(d => !isNaN(d.getTime()), {
    message: "Invalid birth date"
  })
})

export type SignupInput = z.infer<typeof signupSchema>