import { z } from "zod"

export const coerceFormDataValue = (value: string | File) => {
  if (value instanceof File) {
    return value
  }

  // Try to parse as boolean
  if (value === "true" || value === "false") {
    return value === "true"
  }

  // Try to parse as number
  if (value.trim() !== "" && z.coerce.number().safeParse(value).success) {
    return z.coerce.number().parse(value)
  }

  return value
}
