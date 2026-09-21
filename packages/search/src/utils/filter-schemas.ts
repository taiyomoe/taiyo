import { z } from "zod"

export const enumFilter = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .object({
      eq: z.enum(values).optional(),
      neq: z.enum(values).optional(),
      in: z.enum(values).array().nonempty().optional(),
      notIn: z.enum(values).array().nonempty().optional(),
    })
    .strict()

export const enumArrayFilter = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .object({
      hasAll: z.enum(values).array().nonempty().optional(),
      hasAny: z.enum(values).array().nonempty().optional(),
      hasNone: z.enum(values).array().nonempty().optional(),
    })
    .strict()

export const uuidArrayFilter = z
  .object({
    hasAll: z.uuid().array().nonempty().optional(),
    hasAny: z.uuid().array().nonempty().optional(),
    hasNone: z.uuid().array().nonempty().optional(),
  })
  .strict()

export const stringArrayFilter = z
  .object({
    hasAll: z.string().array().nonempty().optional(),
    hasAny: z.string().array().nonempty().optional(),
    hasNone: z.string().array().nonempty().optional(),
  })
  .strict()

export const dateFilter = z
  .object({
    before: z.iso.datetime().optional(),
    after: z.iso.datetime().optional(),
    between: z.tuple([z.iso.datetime(), z.iso.datetime()]).optional(),
    isNull: z.boolean().optional(),
  })
  .strict()
