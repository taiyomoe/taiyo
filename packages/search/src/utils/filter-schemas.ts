import { z } from "zod"
import { MAX_FILTER_VALUES } from "./constants"

export const enumFilter = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .object({
      eq: z.enum(values).optional().meta({ description: "Only keep medias with this value." }),
      neq: z.enum(values).optional().meta({ description: "Exclude medias with this value." }),
      in: z
        .enum(values)
        .array()
        .nonempty()
        .max(MAX_FILTER_VALUES)
        .optional()
        .meta({ description: "Only keep medias with one of these values." }),
      notIn: z
        .enum(values)
        .array()
        .nonempty()
        .max(MAX_FILTER_VALUES)
        .optional()
        .meta({ description: "Exclude medias with one of these values." }),
    })
    .strict()

const arrayFilter = <T extends z.ZodType>(value: T) =>
  z
    .object({
      hasAll: value
        .array()
        .nonempty()
        .max(MAX_FILTER_VALUES)
        .optional()
        .meta({ description: "Only keep medias with every one of these values." }),
      hasAny: value
        .array()
        .nonempty()
        .max(MAX_FILTER_VALUES)
        .optional()
        .meta({ description: "Only keep medias with at least one of these values." }),
      hasNone: value
        .array()
        .nonempty()
        .max(MAX_FILTER_VALUES)
        .optional()
        .meta({ description: "Exclude medias with any of these values." }),
    })
    .strict()

export const enumArrayFilter = <T extends readonly [string, ...string[]]>(values: T) =>
  arrayFilter(z.enum(values))

export const uuidArrayFilter = arrayFilter(z.uuid())

export const stringArrayFilter = arrayFilter(z.string())

export const dateFilter = z
  .object({
    before: z.iso.datetime().optional().meta({ description: "Only keep dates before this one." }),
    after: z.iso.datetime().optional().meta({ description: "Only keep dates after this one." }),
    between: z
      .tuple([z.iso.datetime(), z.iso.datetime()])
      .optional()
      .meta({ description: "Only keep dates between these two, both included." }),
    isNull: z
      .boolean()
      .optional()
      .meta({ description: "Only keep medias without this date (`true`) or with it (`false`)." }),
  })
  .strict()

const count = z.number().int().nonnegative()

export const countFilter = z
  .object({
    eq: count.optional().meta({ description: "Only keep counts equal to this one." }),
    gte: count
      .optional()
      .meta({ description: "Only keep counts greater than or equal to this one." }),
    lte: count.optional().meta({ description: "Only keep counts less than or equal to this one." }),
    between: z
      .tuple([count, count])
      .optional()
      .meta({ description: "Only keep counts between these two, both included." }),
  })
  .strict()
