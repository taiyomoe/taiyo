import { z } from "zod"
import { zodMessages } from "~/utils/zod-messages"
import { emailSchema, passwordSchema } from "./common.schemas"

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, zodMessages.username.min3Characters)
      .max(30, zodMessages.username.max30Characters)
      .regex(/^[a-zA-Z0-9_.]+$/, zodMessages.username.invalidCharacters),
    email: emailSchema,
    password: passwordSchema,
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

export const signInEmailSchema = z.object({
  email: emailSchema,
  password: z.string().nonempty(zodMessages.password.required),
  rememberMe: z.boolean().default(true),
  turnstileToken: z.string(),
})

export const signInUsernameSchema = signInEmailSchema
  .omit({ email: true })
  .extend({ username: z.string().nonempty(zodMessages.username.required) })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  turnstileToken: z.string(),
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().nonempty(zodMessages.password.required),
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

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInEmailInput = z.infer<typeof signInEmailSchema>
export type SignInUsernameInput = z.infer<typeof signInUsernameSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
