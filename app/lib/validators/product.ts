import { Decimal } from "@prisma/client-runtime-utils";
import { z } from "zod";

export const productSchema = z.object({
    name: z
        .string()
        .min(1, "Name too short"),
    
    description: z
        .string()
        .min(1, "Description too short"),

    category: z
        .string()
        .min(1, "Category too short"),
    
    price: z
        .string().refine((val) => !isNaN(Number(val)), {
            message: "Invalid number."
        })
        .transform((val) => new Decimal(val)),

    quantity: z
        .number()
        .int()
        .nonnegative()
        .max(2147483647, "Invalid quantity"),

    image_url: z
        .url("Invalid url"),
})