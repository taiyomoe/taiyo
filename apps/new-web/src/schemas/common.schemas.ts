import { z } from "zod"

export const emailSchema = z.string().nonempty().email().max(100)
