import { z } from "zod"

export const coerceFormDataValue = (value: string | File) => {
  if (value instanceof File) {
    return value
  }

  if (value === "true" || value === "false") {
    return value === "true"
  }

  if (value.trim() !== "" && z.coerce.number().safeParse(value).success) {
    return z.coerce.number().parse(value)
  }

  return value
}
