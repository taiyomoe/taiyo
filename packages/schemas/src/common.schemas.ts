import { z } from "zod"

export const idSchema = z.string().uuid()

export const pageSchema = z.coerce.number().int().positive().default(1)

export const perPageSchema = (initial: number, choices: number[]) =>
  z.coerce
    .number()
    .optional()
    .default(initial)
    .refine((x) => choices.includes(x), {
      message: `perPage must be one of ${choices.join(", ")}`,
    })

export const optionalUrlSchema = (startsWith?: string[]) =>
  z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .refine((v) => {
      if (v === "" || !startsWith) return true
      if (!v) return false

      return startsWith.some((s) => v.startsWith(s))
    })
