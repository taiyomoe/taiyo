import { z } from "zod"

export const idSchema = z.string().uuid()

export const pageSchema = z.coerce.number().int().positive().default(1)

