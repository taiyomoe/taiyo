import { z } from "zod"

const quote = (value: string) => `"${value.replace(/"/g, '\\"')}"`
const enumOpsSchema = z.object({
  eq: z.string().optional(),
  neq: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
})
const arrayOpsSchema = z.object({
  hasAll: z.string().array().optional(),
  hasAny: z.string().array().optional(),
  hasNone: z.string().array().optional(),
})
const dateOpsSchema = z.object({
  before: z.string().optional(),
  after: z.string().optional(),
  between: z.tuple([z.string(), z.string()]).optional(),
  isNull: z.boolean().optional(),
})
const countOpsSchema = z.object({
  eq: z.number().optional(),
  gte: z.number().optional(),
  lte: z.number().optional(),
  between: z.tuple([z.number(), z.number()]).optional(),
})

type EnumOps = z.infer<typeof enumOpsSchema>
type ArrayOps = z.infer<typeof arrayOpsSchema>
type DateOps = z.infer<typeof dateOpsSchema>
type CountOps = z.infer<typeof countOpsSchema>

const fromEnum = (attr: string, ops: EnumOps) => {
  const clauses: string[] = []

  if (ops.eq !== undefined) {
    clauses.push(`${attr} = ${quote(ops.eq)}`)
  }

  if (ops.neq !== undefined) {
    clauses.push(`${attr} != ${quote(ops.neq)}`)
  }

  if (ops.in !== undefined && ops.in.length > 0) {
    clauses.push(`${attr} IN [${ops.in.map(quote).join(", ")}]`)
  }

  if (ops.notIn !== undefined && ops.notIn.length > 0) {
    clauses.push(`${attr} NOT IN [${ops.notIn.map(quote).join(", ")}]`)
  }

  return clauses
}
const fromArray = (attr: string, ops: ArrayOps) => {
  const clauses: string[] = []

  // hasAll → one equality per value; Meilisearch matches each against any
  // element of the array, so chaining with AND enforces "contains every".
  if (ops.hasAll !== undefined && ops.hasAll.length > 0) {
    for (const value of ops.hasAll) {
      clauses.push(`${attr} = ${quote(value)}`)
    }
  }

  if (ops.hasAny !== undefined && ops.hasAny.length > 0) {
    clauses.push(`${attr} IN [${ops.hasAny.map(quote).join(", ")}]`)
  }

  if (ops.hasNone !== undefined && ops.hasNone.length > 0) {
    clauses.push(`${attr} NOT IN [${ops.hasNone.map(quote).join(", ")}]`)
  }

  return clauses
}
const fromDate = (attr: string, ops: DateOps) => {
  const clauses: string[] = []
  const ts = (iso: string) => new Date(iso).getTime()

  if (ops.before !== undefined) {
    clauses.push(`${attr} < ${ts(ops.before)}`)
  }

  if (ops.after !== undefined) {
    clauses.push(`${attr} > ${ts(ops.after)}`)
  }

  if (ops.between !== undefined) {
    clauses.push(`${attr} ${ts(ops.between[0])} TO ${ts(ops.between[1])}`)
  }

  if (ops.isNull === true) {
    clauses.push(`${attr} IS NULL`)
  }

  if (ops.isNull === false) {
    clauses.push(`${attr} IS NOT NULL`)
  }

  return clauses
}
const fromCount = (attr: string, ops: CountOps) => {
  const clauses: string[] = []

  if (ops.eq !== undefined) {
    clauses.push(`${attr} = ${ops.eq}`)
  }

  if (ops.gte !== undefined) {
    clauses.push(`${attr} >= ${ops.gte}`)
  }

  if (ops.lte !== undefined) {
    clauses.push(`${attr} <= ${ops.lte}`)
  }

  if (ops.between !== undefined) {
    clauses.push(`${attr} ${ops.between[0]} TO ${ops.between[1]}`)
  }

  return clauses
}

export type FilterSpec<TDocument> = Record<
  string,
  | { kind: "enum"; attr: keyof TDocument }
  | { kind: "array"; attr: keyof TDocument }
  | { kind: "date"; attr: keyof TDocument }
  | { kind: "count"; attr: keyof TDocument }
>

export const translateFilter = (
  spec: FilterSpec<Record<string, unknown>>,
  filter: Record<string, unknown>,
) => {
  const clauses: string[] = []

  for (const [field, fieldSpec] of Object.entries(spec)) {
    const ops = filter[field]

    if (ops === undefined) {
      continue
    }

    switch (fieldSpec.kind) {
      case "enum":
        clauses.push(...fromEnum(fieldSpec.attr, enumOpsSchema.parse(ops)))

        break

      case "array":
        clauses.push(...fromArray(fieldSpec.attr, arrayOpsSchema.parse(ops)))

        break

      case "date":
        clauses.push(...fromDate(fieldSpec.attr, dateOpsSchema.parse(ops)))

        break

      case "count":
        clauses.push(...fromCount(fieldSpec.attr, countOpsSchema.parse(ops)))

        break
    }
  }

  return clauses.length === 0 ? undefined : clauses.join(" AND ")
}
