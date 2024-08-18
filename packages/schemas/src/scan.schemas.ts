import {
  DEFAULT_SCANS_LIST_PER_PAGE,
  SCANS_LIST_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"
import { optionalUrlSchema, pageSchema, perPageSchema } from "./common.schemas"

export const createScanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  logo: optionalUrlSchema(),
  banner: optionalUrlSchema(),
  website: optionalUrlSchema(),
  discord: optionalUrlSchema(["https://discord.gg/"]),
  twitter: optionalUrlSchema(["https://twitter.com/", "https://x.com/"]),
  facebook: optionalUrlSchema(["https://facebook.com/"]),
  instagram: optionalUrlSchema(["https://instagram.com/"]),
  telegram: optionalUrlSchema(["https://t.me/"]),
  youtube: optionalUrlSchema(["https://youtube.com/"]),
  email: z.string().email().optional().or(z.literal("")),
})

export const getScansListSchema = z.object({
  search: z.string().optional(),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_SCANS_LIST_PER_PAGE,
    SCANS_LIST_PER_PAGE_CHOICES,
  ),
})

export const bulkDeleteScansSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
})

export type CreateScanInput = typeof createScanSchema._type
