import { z } from "zod";

import { cpf as c} from "cpf-cnpj-validator";

export const addressSchema = z.object({
  cep: z.string().length(9),
  street: z.string().min(2),
  number: z.string().min(1),
  complement: z.string().optional(), // Complemento é o único opcional
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  recipientName: z.string().min(3),
  phone: z.string().min(14), // Mínimo de 14 para (XX) XXXX-XXXX
  cpf: z.string().length(14).refine((cpf) => c.isValid(cpf), {
    message: "CPF inválido matemático",
  }),
});