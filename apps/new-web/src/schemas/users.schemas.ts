import { z } from "zod"
import { emailSchema } from "./common.schemas"

export const signUpSchema = z
  .object({
    name: z.string().min(1).max(30),
    email: emailSchema,
    password: z
      .string()
      .nonempty("Ce champ est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Le mot de passe doit contenir au moins un caractère spécial",
      ),
    confirmPassword: z.string().nonempty("Ce champ est requis"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
      })
    }
  })

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().nonempty("Ce champ est requis"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
