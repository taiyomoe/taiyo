import { z } from "zod"
import { zodMessages } from "~/utils/zod-messages"
import { emailSchema } from "./common.schemas"

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, zodMessages.username.min3Characters)
      .max(30, zodMessages.username.max30Characters)
      .regex(/^[a-zA-Z0-9_.]+$/, zodMessages.username.invalidCharacters),
    email: emailSchema,
    password: z
      .string()
      .min(8, zodMessages.password.min8Character)
      .max(50, zodMessages.password.max50Characters)
      .regex(/[0-9]/, zodMessages.password.atLeast1Number)
      .regex(/[A-Z]/, zodMessages.password.atLeast1Uppercase)
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        zodMessages.password.atLeast1SpecialCharacter,
      ),
    confirmPassword: z.string().nonempty(zodMessages.password.required),
    turnstileToken: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: zodMessages.password.mismatch,
        path: ["confirmPassword"],
      })
    }
  })

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().nonempty(zodMessages.password.required),
  turnstileToken: z.string(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
