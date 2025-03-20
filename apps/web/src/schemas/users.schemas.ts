import { USERNAME_REGEX } from "@taiyomoe/utils"
import { z } from "zod"
import { zodMessages } from "~/utils/zod-messages"
import { emailSchema, passwordSchema } from "./common.schemas"

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, zodMessages.username.min3Characters)
      .max(30, zodMessages.username.max30Characters)
      .regex(USERNAME_REGEX, zodMessages.username.invalidCharacters),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().nonempty(zodMessages.password.required),
    turnstileToken: z.string().nonempty(),
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

export const signInMagicLinkSchema = z.object({
  email: emailSchema,
  turnstileToken: z.string().nonempty(),
})

export const signInEmailSchema = z.object({
  email: emailSchema,
  password: z.string().nonempty(zodMessages.password.required),
  rememberMe: z.boolean().default(true),
  turnstileToken: z.string().nonempty(),
})

export const signInUsernameSchema = signInEmailSchema
  .omit({ email: true })
  .extend({ username: z.string().nonempty(zodMessages.username.required) })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  turnstileToken: z.string().nonempty(),
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
export type SignInMagicLinkInput = z.infer<typeof signInMagicLinkSchema>
export type SignInEmailInput = z.infer<typeof signInEmailSchema>
export type SignInUsernameInput = z.infer<typeof signInUsernameSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
