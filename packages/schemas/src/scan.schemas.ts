import {
  DEFAULT_SCANS_LIST_PER_PAGE,
  SCANS_LIST_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"
import { pageSchema, perPageSchema } from "./common.schemas"

export const createScanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
  website: z.string().url().optional(),
  discord: z.string().url().startsWith("https://discord.gg/").optional(),
  twitter: z
    .union([
      z.string().url().startsWith("https://twitter.com/"),
      z.string().url().startsWith("https://x.com/"),
    ])
    .optional(),
  facebook: z.string().url().startsWith("https://facebook.com/").optional(),
  instagram: z.string().url().startsWith("https://instagram.com/").optional(),
  telegram: z.string().url().startsWith("https://t.me/").optional(),
  youtube: z.string().url().startsWith("https://youtube.com/").optional(),
  email: z.string().email().optional(),
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
