import { z } from "zod"

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

export type CreateScanInput = typeof createScanSchema._type
