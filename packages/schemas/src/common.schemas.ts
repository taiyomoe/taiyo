import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from "@taiyomoe/constants"
import { z } from "zod"
import { nullablePreprocessor } from "./utils/nullable-preprocessor"

export const idSchema = z.string().uuid()
export const pageSchema = z.coerce.number().int().positive().catch(1)
export const intsSchema = z.coerce.number().array().catch([])
export const uuidsSchema = z.string().uuid().array().catch([])
export const chapterNumberSchema = z.coerce.number().min(0)
export const chapterVolumeSchema = z.coerce.number().min(0).nullish()
export const mimeTypeSchema = z.enum(ALLOWED_MIME_TYPES)
export const extensionSchema = z.enum(ALLOWED_EXTENSIONS)
export const fileSchema = z.object({
  name: z.string(),
  size: z.coerce.number().int().positive(),
  mimeType: mimeTypeSchema,
  extension: extensionSchema,
  file: z.instanceof(File).optional(),
})

export const perPageSchema = (initial: number, choices: number[]) =>
  z.coerce
    .number()
    .optional()
    .default(initial)
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

export const queryableFieldsSchema = <
  TType extends z.ZodEnum<[string, ...string[]]>,
>(
  input: TType,
) =>
  z
    .object({
      attributes: input.array().nonempty().catch(["*"]),
      q: z.string().optional().default(""),
    })
    .optional()
    .default({ attributes: ["*"], q: "" })

export const sortableFieldsSchema = <
  TType extends readonly [string, ...string[]],
>(
  input: TType,
) =>
  z
    .tuple([
      z.enum(input).transform((v) => {
        if (!["uploader", "media", "scans", "deleter"].includes(v)) {
          return v
        }

        switch (v) {
          case "uploader":
            return "uploaderId"
          case "media":
            return "mediaId"
          case "scans":
            return "scanIds"
          case "deleter":
            return "deleterId"
          default:
            return v
        }
      }),
      z.enum(["asc", "desc"]),
    ])
    .array()
    .optional()
    .default([])

export const buildFilterSchema = <
  TName extends string,
  TSchema extends z.ZodType,
>(
  name: TName,
  schema: TSchema,
) => {
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
  const invertedName = `not${capitalized}`

  return {
    [name]: schema,
    [invertedName]: schema,
  } as Record<TName | `not${Capitalize<TName>}`, TSchema>
}

export const enumFilterSchema = <TSchema extends z.ZodSchema>(input: TSchema) =>
  z
    .object({
      equals: input.optional().catch(undefined),
      not: input.optional().catch(undefined),
      in: input.array().optional().catch(undefined),
      notIn: input.array().optional().catch(undefined),
    })
    .optional()

export const dateFilterSchema = z.preprocess(
  (input) => {
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input).map(([k, v]) => [k, v === null ? undefined : v]),
      )
    }

    return input
  },
  z
    .object({
      lt: z.coerce.date().optional().catch(undefined),
      gt: z.coerce.date().optional().catch(undefined),
    })
    .optional(),
)

/**
 * This schema is used to parse date search params (mainly deletedAt).
 *
 * A typical input looks like this:
 * { equals: "null", lt: null, gt: null }
 * { equals: "notNull", lt: null, gt: null }
 *
 * This schema will convert it to:
 * { equals: null, not: undefined, lt: undefined, gt: undefined }
 * { equals: undefined, not: null, lt: undefined, gt: undefined }
 *
 * If you pay attention, you'll note that in the input the `equals` property is a string.
 * This is expected behavior because this comes directly from the URL.
 * It'll get converted to a null value in the schema.
 */
export const nullableDateFilterSchema = z.preprocess(
  nullablePreprocessor,
  z
    .object({
      equals: z.null().optional().catch(undefined),
      not: z.null().optional().catch(undefined),
      lt: z.coerce.date().optional().catch(undefined),
      gt: z.coerce.date().optional().catch(undefined),
    })
    .optional(),
)

export const textFilterSchema = z
  .object({
    equals: z.string().optional().catch(undefined),
    not: z.string().optional().catch(undefined),
    startsWith: z.string().optional().catch(undefined),
    endsWith: z.string().optional().catch(undefined),
    in: z.string().array().optional().catch(undefined),
    notIn: z.string().array().optional().catch(undefined),
  })
  .optional()

export const nullableTextFilterSchema = z.preprocess(
  nullablePreprocessor,
  z
    .object({
      equals: z.union([z.string(), z.null()]).optional().catch(undefined),
      not: z.union([z.string(), z.null()]).optional().catch(undefined),
      startsWith: z.string().optional().catch(undefined),
      endsWith: z.string().optional().catch(undefined),
      in: z.string().array().optional().catch(undefined),
      notIn: z.string().array().optional().catch(undefined),
    })
    .optional(),
)

const rawNumberFilterSchema = z.preprocess(
  (v) => (v === null ? undefined : v),
  z.coerce.number(),
)
export const numberFilterSchema = z
  .object({
    equals: rawNumberFilterSchema.optional().catch(undefined),
    not: rawNumberFilterSchema.optional().catch(undefined),
    gt: rawNumberFilterSchema.optional().catch(undefined),
    gte: rawNumberFilterSchema.optional().catch(undefined),
    lt: rawNumberFilterSchema.optional().catch(undefined),
    lte: rawNumberFilterSchema.optional().catch(undefined),
  })
  .optional()

export const nullableNumberFilterSchema = z.preprocess(
  nullablePreprocessor,
  z
    .object({
      equals: z
        .union([rawNumberFilterSchema, z.null()])
        .optional()
        .catch(undefined),
      not: z
        .union([rawNumberFilterSchema, z.null()])
        .optional()
        .catch(undefined),
      gt: rawNumberFilterSchema.optional().catch(undefined),
      gte: rawNumberFilterSchema.optional().catch(undefined),
      lt: rawNumberFilterSchema.optional().catch(undefined),
      lte: rawNumberFilterSchema.optional().catch(undefined),
    })
    .optional(),
)

export const bulkMutateSchema = z.object({
  type: z.enum(["restore", "delete"]),
  ids: z.array(z.string().uuid()).min(1),
})
