import type { SearchParams } from "nuqs"
import type { createSearchParamsCache } from "nuqs/server"
import { construct } from "radash"
import type { z } from "zod"

export const sanitizeSearchParams = <TSchema extends z.ZodSchema>(
  rawSearchParams: SearchParams,
  parser: ReturnType<typeof createSearchParamsCache>,
  schema: TSchema,
) => {
  const parsed = parser.parse(rawSearchParams)
  const constructed = construct(parsed)

  return schema.parse(constructed) as z.infer<TSchema>
}
