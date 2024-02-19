import { z } from "zod"
import { ScanSchema } from "./prisma"

export const insertScanSchema = ScanSchema.pick({
  name: true,
  description: true,
  logo: true,
  banner: true,
  website: true,
  discord: true,
  twitter: true,
  facebook: true,
  instagram: true,
  telegram: true,
  youtube: true,
  email: true,
})
  .partial()
  .required({ name: true })

export const searchScanSchema = z.string().min(1)

export type InsertScanSchema = typeof insertScanSchema._type
