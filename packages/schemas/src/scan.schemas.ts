import {
  DEFAULT_SCANS_LIST_PER_PAGE,
  SCANS_LIST_PER_PAGE_CHOICES,
  SCANS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import { z } from "zod"
import {
  dateFilterSchema,
  idSchema,
  nullableDateFilterSchema,
  nullableTextFilterSchema,
  optionalStringSchema,
  optionalUrlSchema,
  pageSchema,
  perPageSchema,
  textFilterSchema,
} from "./common.schemas"

export const createScanSchema = z.object({
  name: z.string().min(2),
  description: optionalStringSchema,
  logo: optionalUrlSchema(),
  banner: optionalUrlSchema(),
  website: optionalUrlSchema(),
  discord: optionalUrlSchema(["https://discord.gg/"]),
  twitter: optionalUrlSchema(["https://twitter.com/", "https://x.com/"]),
  facebook: optionalUrlSchema(["https://facebook.com/"]),
  instagram: optionalUrlSchema(["https://instagram.com/"]),
  telegram: optionalUrlSchema(["https://t.me/"]),
  youtube: optionalUrlSchema(["https://youtube.com/"]),
  email: z.string().email().nullish().or(z.literal("")),
})

export const updateScanSchema = createScanSchema.partial().extend({
  id: idSchema,
})

export const getScansListSchema = z.object({
  createdAt: dateFilterSchema,
  updatedAt: dateFilterSchema,
  deletedAt: nullableDateFilterSchema,
  name: textFilterSchema,
  description: nullableTextFilterSchema,
  website: nullableTextFilterSchema,
  discord: nullableTextFilterSchema,
  twitter: nullableTextFilterSchema,
  facebook: nullableTextFilterSchema,
  instagram: nullableTextFilterSchema,
  telegram: nullableTextFilterSchema,
  youtube: nullableTextFilterSchema,
  email: nullableTextFilterSchema,
  sort: z
    .tuple([z.enum(SCANS_LIST_SORTABLE_FIELDS), z.enum(["asc", "desc"])])
    .array()
    .catch([["createdAt", "desc"]]),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_SCANS_LIST_PER_PAGE,
    SCANS_LIST_PER_PAGE_CHOICES,
  ),
})

export type CreateScanInput = z.infer<typeof createScanSchema>
export type UpdateScanInput = z.infer<typeof updateScanSchema>
export type GetScansListInput = z.infer<typeof getScansListSchema>
