import { camel, mapValues } from "radash"

export const buildFilter = (input: Record<string, unknown[]>) =>
  Object.values(
    mapValues(input, (arr, k) => {
      if (arr.length === 0) return ""

      const normalizedKey = camel(k.replace(/^not/, "").replace(/s$/, ""))
      const operator = k.startsWith("not") ? "!=" : "="
      const mapped = arr
        .map((v) => `${normalizedKey} ${operator} ${v}`)
        .join(" OR ")

      return `(${mapped})`
    }),
  )
    .filter(Boolean)
    .join(" AND ")
