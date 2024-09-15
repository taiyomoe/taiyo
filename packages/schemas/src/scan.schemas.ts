import {
  DEFAULT_SCANS_LIST_PER_PAGE,
  SCANS_LIST_PER_PAGE_CHOICES,
  SCANS_LIST_QUERYABLE_FIELDS,
  SCANS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import { z } from "zod"
import {
  idSchema,
  optionalStringSchema,
  optionalUrlSchema,
  pageSchema,
  perPageSchema,
  queryableFieldsSchema,
  sortableFieldsSchema,
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
  query: queryableFieldsSchema(SCANS_LIST_QUERYABLE_FIELDS),
  filter: z.string().optional().default(""),
  sort: sortableFieldsSchema(SCANS_LIST_SORTABLE_FIELDS),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_SCANS_LIST_PER_PAGE,
    SCANS_LIST_PER_PAGE_CHOICES,
  ),
})

export type CreateScanInput = typeof createScanSchema._type
export type UpdateScanInput = typeof updateScanSchema._type
