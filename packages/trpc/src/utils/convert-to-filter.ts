import { Prisma } from "@taiyomoe/db"
import { isObject, mapValues } from "radash"

export const convertToFilter = (
  input: Record<string, unknown>,
): Record<string, unknown> =>
  mapValues(input, (v) => {
    if (isObject(v)) return convertToFilter(v as Record<string, unknown>)

    return v === undefined ? Prisma.skip : v
  })
