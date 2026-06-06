const quote = (value: string) => `"${value.replace(/"/g, '\\"')}"`

type EnumOps = { eq?: string; neq?: string; in?: string[]; notIn?: string[] }
type ArrayOps = { hasAll?: string[]; hasAny?: string[]; hasNone?: string[] }
type DateOps = {
  before?: string
  after?: string
  between?: [string, string]
  isNull?: boolean
}

const fromEnum = (attr: string, ops: EnumOps) => {
  const clauses: string[] = []

  if (ops.eq !== undefined) clauses.push(`${attr} = ${quote(ops.eq)}`)

  if (ops.neq !== undefined) clauses.push(`${attr} != ${quote(ops.neq)}`)

  if (ops.in?.length) clauses.push(`${attr} IN [${ops.in.map(quote).join(", ")}]`)

  if (ops.notIn?.length) clauses.push(`${attr} NOT IN [${ops.notIn.map(quote).join(", ")}]`)

  return clauses
}
const fromArray = (attr: string, ops: ArrayOps) => {
  const clauses: string[] = []

  // hasAll → one equality per value; Meilisearch matches each against any
  // element of the array, so chaining with AND enforces "contains every".
  if (ops.hasAll?.length) {
    for (const value of ops.hasAll) clauses.push(`${attr} = ${quote(value)}`)
  }

  if (ops.hasAny?.length) clauses.push(`${attr} IN [${ops.hasAny.map(quote).join(", ")}]`)

  if (ops.hasNone?.length) clauses.push(`${attr} NOT IN [${ops.hasNone.map(quote).join(", ")}]`)

  return clauses
}
const fromDate = (attr: string, ops: DateOps) => {
  const clauses: string[] = []
  const ts = (iso: string) => new Date(iso).getTime()

  if (ops.before !== undefined) clauses.push(`${attr} < ${ts(ops.before)}`)

  if (ops.after !== undefined) clauses.push(`${attr} > ${ts(ops.after)}`)

  if (ops.between !== undefined) {
    clauses.push(`${attr} ${ts(ops.between[0])} TO ${ts(ops.between[1])}`)
  }

  if (ops.isNull === true) clauses.push(`${attr} IS NULL`)

  if (ops.isNull === false) clauses.push(`${attr} IS NOT NULL`)

  return clauses
}

export type FilterSpec<TDocument> = Record<
  string,
  | { kind: "enum"; attr: keyof TDocument }
  | { kind: "array"; attr: keyof TDocument }
  | { kind: "date"; attr: keyof TDocument }
>

/**
 * Translates a validated filter DSL into a Meilisearch filter string.
 *
 * `spec` declares, per DSL field, which document attribute the clause
 * targets and which operator family to apply. Returns `undefined` when no
 * clauses are present so callers can omit the `filter` argument entirely.
 *
 * Resource-agnostic: each resource (medias, chapters, ...) ships its own
 * `FilterSpec` and the typed Zod schema that produces compatible inputs.
 */
export const translateFilter = (
  spec: FilterSpec<Record<string, unknown>>,
  filter: Record<string, unknown>,
) => {
  const clauses: string[] = []

  for (const [field, fieldSpec] of Object.entries(spec)) {
    const ops = filter[field]

    if (ops === undefined) continue

    switch (fieldSpec.kind) {
      case "enum":
        clauses.push(...fromEnum(fieldSpec.attr, ops as EnumOps))

        break

      case "array":
        clauses.push(...fromArray(fieldSpec.attr, ops as ArrayOps))

        break

      case "date":
        clauses.push(...fromDate(fieldSpec.attr, ops as DateOps))

        break
    }
  }

  return clauses.length === 0 ? undefined : clauses.join(" AND ")
}
