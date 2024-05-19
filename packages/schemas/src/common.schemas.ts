import { z } from "zod"

export const idSchema = z.string().uuid()

export const nameSchema = z.string().min(1)
