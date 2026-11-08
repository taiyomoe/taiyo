import {
  AUDIT_LOG_FIELDS,
  type AuditLogField,
  KQL_KEYWORDS,
  quoteKqlValue,
} from "@taiyomoe/audit/query"
import { getKqlContext, type KqlContext } from "@/features/activity-log/lib/kql-context"
import { getKqlRoles, type KqlRole } from "@/features/activity-log/lib/kql-roles"

export { getKqlContext, getKqlRoles }

export type { KqlContext, KqlRole }

export type KqlSuggestion = {
  key: string
  kind: "field" | "value" | "operator" | "keyword"
  label: string
  description: string | null
  field: AuditLogField | null
  image: string | null
  nameEffect?: string | null
  avatarBorder?: string | null
  insert: string
  start: number
  end: number
}

const BARE_VALUE = /^[^\s():<>"\\]+$/
const byRank = <T>(items: readonly T[], prefix: string, getText: (item: T) => string) => {
  const query = prefix.toLowerCase()

  return items
    .map((item) => {
      const lower = getText(item).toLowerCase()
      let score = lower.includes(query) ? 1 : -1

      if (lower.startsWith(query)) {
        score = 0
      }

      return { item, score }
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item)
}

export const getTermSuggestions = (
  context: Extract<KqlContext, { kind: "term" }>,
  describeField: (field: AuditLogField) => string,
) => {
  const keywords = (context.afterClause ? ["and", "or", "not"] : ["not"])
    .filter((keyword) => context.prefix === "" || keyword.startsWith(context.prefix.toLowerCase()))
    .map(
      (keyword) =>
        ({
          key: `keyword-${keyword}`,
          kind: "keyword",
          label: keyword,
          description: null,
          field: null,
          image: null,
          insert: `${keyword} `,
          start: context.start,
          end: context.end,
        }) satisfies KqlSuggestion,
    )
  const fields = byRank(AUDIT_LOG_FIELDS, context.prefix, (field) => field.name).map(
    (field) =>
      ({
        key: `field-${field.name}`,
        kind: "field",
        label: field.name,
        description: describeField(field),
        field,
        image: null,
        insert: `${field.name}: `,
        start: context.start,
        end: context.end,
      }) satisfies KqlSuggestion,
  )

  return context.afterClause ? [...keywords, ...fields] : [...fields, ...keywords]
}

export const getOperatorSuggestions = (
  context: Extract<KqlContext, { kind: "operator" }>,
  describeOperator: (operator: string) => string,
) =>
  [":", ...(context.field.range === true ? ["<", "<=", ">", ">="] : [])].map(
    (operator) =>
      ({
        key: `operator-${operator}`,
        kind: "operator",
        label: operator,
        description: describeOperator(operator),
        field: context.field,
        image: null,
        insert: `${operator} `,
        start: context.start,
        end: context.end,
      }) satisfies KqlSuggestion,
  )

export const getValueSuggestions = (
  context: Extract<KqlContext, { kind: "value" }>,
  values: ReadonlyArray<{
    value: string
    label: string | null
    image: string | null
    nameEffect?: string | null
    avatarBorder?: string | null
  }>,
  anyValueDescription: string,
) => {
  const matching = byRank(values, context.prefix, (value) => `${value.value} ${value.label ?? ""}`)

  return [
    ...matching.map((value) => {
      const lower = value.value.toLowerCase()
      const bare =
        BARE_VALUE.test(value.value) && !KQL_KEYWORDS.some((keyword) => keyword === lower)

      return {
        key: `value-${value.value}`,
        kind: "value",
        label: value.value,
        description: value.label,
        field: context.field,
        image: value.image,
        nameEffect: value.nameEffect ?? null,
        avatarBorder: value.avatarBorder ?? null,
        insert: `${bare ? value.value : quoteKqlValue(value.value)} `,
        start: context.start,
        end: context.end,
      } satisfies KqlSuggestion
    }),
    ...(context.prefix === "" && context.field.range !== true
      ? [
          {
            key: "value-*",
            kind: "value",
            label: "*",
            description: anyValueDescription,
            field: context.field,
            image: null,
            insert: "* ",
            start: context.start,
            end: context.end,
          } satisfies KqlSuggestion,
        ]
      : []),
  ]
}
