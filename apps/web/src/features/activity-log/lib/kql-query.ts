import { parseKql, quoteKqlValue, tokenizeKql } from "@taiyomoe/audit/query"

export const DEFAULT_QUERY = 'not category: "audit"'

export const matchClause = (field: string, value: string, negate = false) =>
  `${negate ? "not " : ""}${field}: ${quoteKqlValue(value)}`

const splitTopLevelAnd = (query: string) => {
  const parsed = parseKql(query)

  if (!parsed.ok || parsed.node?.type === "or") {
    return query.trim() === "" ? [] : [`(${query.trim()})`]
  }

  const segments: string[] = []
  let depth = 0
  let start = 0

  for (const token of tokenizeKql(query)) {
    if (token.type === "lparen") {
      depth += 1
    } else if (token.type === "rparen") {
      depth -= 1
    } else if (depth === 0 && token.type === "keyword" && token.value === "and") {
      segments.push(query.slice(start, token.start).trim())
      start = token.end
    }
  }

  segments.push(query.slice(start).trim())

  return segments.filter((segment) => segment !== "")
}

export const andClauses = (query: string, clauses: readonly string[]) => {
  const replaced = new Set(clauses.map((clause) => clause.replace(/^not /, "").toLowerCase()))
  const kept = splitTopLevelAnd(query).filter(
    (segment) => !replaced.has(segment.replace(/^not\s+/i, "").toLowerCase()),
  )

  return [...kept, ...clauses].join(" and ")
}
