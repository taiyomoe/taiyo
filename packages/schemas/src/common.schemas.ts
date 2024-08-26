import { z } from "zod"

export const idSchema = z.string().uuid()
export const pageSchema = z.coerce.number().int().positive().catch(1)
export const intsSchema = z.coerce.number().array().catch([])
export const uuidsSchema = z.string().uuid().array().catch([])

export const perPageSchema = (initial: number, choices: number[]) =>
  z.coerce
    .number()
    .optional()
    .refine((x) => choices.includes(x ?? initial))
    .catch(initial)

export const optionalStringSchema = z
  .string()
  .nullish()
  .or(z.literal("").transform(() => undefined))

export const optionalEnumSchema = (input: z.ZodSchema) =>
  input.nullish().or(z.literal("").transform(() => undefined))

export const optionalUrlSchema = (startsWith?: string[]) =>
  z
    .string()
    .url()
    .nullish()
    .or(z.literal("").transform(() => undefined))
    .refine((v) => {
      if (!v || !startsWith) return true

      return startsWith.some((s) => v.startsWith(s))
    })
