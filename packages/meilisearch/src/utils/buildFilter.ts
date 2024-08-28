import { camel, mapValues } from "radash"

const isNegatedField = (key: string) => key.startsWith("not")
const isArrayField = (key: string) => key.endsWith("Ids")

const getNormalizedKey = (key: string) =>
  camel(key.replace(/^not/, "").replace(isArrayField(key) ? "" : /s$/, ""))
const getOperator = (key: string) => {
  switch (true) {
    case isNegatedField(key) && isArrayField(key):
      return "NOT IN"
    case isArrayField(key):
      return "IN"
    case isNegatedField(key):
      return "!="
    default:
      return "="
  }
}

const buildSingleClause = (key: string, values: unknown[]) =>
  values
    .map((v) => `${getNormalizedKey(key)} ${getOperator(key)} ${v}`)
    .join(" OR ")

const buildArrayClause = (key: string, values: unknown[]) =>
  `${getNormalizedKey(key)} ${getOperator(key)} [${values.join(", ")}]`

export const buildFilter = (input: Record<string, unknown[]>) =>
  Object.values(
    mapValues(input, (arr, k) => {
      if (arr.length === 0) return ""

      return `(${isArrayField(k) ? buildArrayClause(k, arr) : buildSingleClause(k, arr)})`
    }),
  )
    .filter(Boolean)
    .join(" AND ")
