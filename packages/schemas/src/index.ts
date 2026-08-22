import { z } from "zod"

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .meta({ description: "The page number to fetch, starting at 1.", example: 1 }),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .meta({ description: "The number of items per page (1-100).", example: 20 }),
})

export const paginationMetaSchema = z.object({
  page: z.int().meta({ description: "The current page number.", example: 1 }),
  perPage: z.int().meta({ description: "The number of items per page.", example: 20 }),
  total: z.int().meta({ description: "The total number of items.", example: 932 }),
})

export const sortDirectionSchema = z
  .enum(["asc", "desc"])
  .meta({ description: "The sort direction.", example: "desc" })
