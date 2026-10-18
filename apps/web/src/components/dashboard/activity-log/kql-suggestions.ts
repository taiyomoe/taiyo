import {
  AUDIT_LOG_FIELDS,
  type AuditLogField,
  getAuditLogField,
  KQL_KEYWORDS,
  type KqlToken,
  quoteKqlValue,
  tokenizeKql,
} from "@taiyomoe/audit/query"

export type KqlContext =
  | { kind: "term"; prefix: string; start: number; end: number; afterClause: boolean }
  | { kind: "operator"; field: AuditLogField; start: number; end: number }
  | { kind: "value"; field: AuditLogField; prefix: string; start: number; end: number }
  | { kind: "none" }

export type KqlSuggestion = {
  key: string
  kind: "field" | "value" | "operator" | "keyword"
  label: string
  description: string | null
  field: AuditLogField | null
  image: string | null
  insert: string
  start: number
  end: number
}

export type KqlRole =
  | "field"
  | "operator"
  | "value"
  | "string"
  | "keyword"
  | "paren"
  | "wildcard"
  | "text"
  | "space"

const EDITABLE_TOKENS = new Set(["word", "keyword", "string"])
const BARE_VALUE = /^[^\s():<>"\\]+$/
const formatKqlValue = (value: string) =>
  BARE_VALUE.test(value) && !KQL_KEYWORDS.some((keyword) => keyword === value.toLowerCase())
    ? value
    : quoteKqlValue(value)
const getTypedPrefix = (text: string, token: KqlToken | undefined, cursor: number) => {
  if (token === undefined) {
    return ""
  }

  return token.type === "string" ? token.value : text.slice(token.start, cursor)
}

export const getKqlContext = (text: string, cursor: number): KqlContext => {
  const tokens = tokenizeKql(text)
  const current = tokens.find(
    (token) => EDITABLE_TOKENS.has(token.type) && token.start < cursor && cursor <= token.end,
  )
  const boundary = current?.start ?? cursor
  const before = tokens.filter((token) => token.type !== "whitespace" && token.end <= boundary)
  const lists: Array<AuditLogField | null> = []

  for (const [index, token] of before.entries()) {
    if (token.type === "lparen") {
      const colon = before[index - 1]
      const name = before[index - 2]

      lists.push(
        colon?.type === "colon" && name?.type === "word"
          ? (getAuditLogField(name.value) ?? null)
          : null,
      )
    } else if (token.type === "rparen") {
      lists.pop()
    }
  }

  const last = before.at(-1)
  const secondLast = before.at(-2)
  const listField = lists.at(-1) ?? null
  const start = current?.start ?? cursor
  const end = current?.end ?? cursor
  const prefix = getTypedPrefix(text, current, cursor)

  if (last?.type === "colon" || last?.type === "range") {
    const field = secondLast?.type === "word" ? getAuditLogField(secondLast.value) : undefined

    return field === undefined ? { kind: "none" } : { kind: "value", field, prefix, start, end }
  }

  if (listField !== null && (last?.type === "lparen" || last?.type === "keyword")) {
    return { kind: "value", field: listField, prefix, start, end }
  }

  if (
    current === undefined &&
    last?.type === "word" &&
    secondLast?.type !== "colon" &&
    secondLast?.type !== "range"
  ) {
    const field = getAuditLogField(last.value)

    if (field !== undefined) {
      return { kind: "operator", field, start: cursor, end: cursor }
    }
  }

  return {
    kind: "term",
    prefix: current?.type === "string" ? "" : prefix,
    start,
    end,
    afterClause:
      last !== undefined &&
      (last.type === "word" || last.type === "string" || last.type === "rparen"),
  }
}

const rank = (candidate: string, prefix: string) => {
  const lower = candidate.toLowerCase()
  const query = prefix.toLowerCase()

  if (lower.startsWith(query)) {
    return 0
  }

  return lower.includes(query) ? 1 : -1
}
const byRank = <T>(items: readonly T[], prefix: string, getText: (item: T) => string) =>
  items
    .map((item) => ({ item, score: rank(getText(item), prefix) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item)

export const getTermSuggestions = (
  context: Extract<KqlContext, { kind: "term" }>,
  describeField: (field: AuditLogField) => string,
): KqlSuggestion[] => {
  const keywords = (context.afterClause ? ["and", "or", "not"] : ["not"])
    .filter((keyword) => context.prefix === "" || keyword.startsWith(context.prefix.toLowerCase()))
    .map((keyword): KqlSuggestion => ({
      key: `keyword-${keyword}`,
      kind: "keyword",
      label: keyword,
      description: null,
      field: null,
      image: null,
      insert: `${keyword} `,
      start: context.start,
      end: context.end,
    }))
  const fields = byRank(AUDIT_LOG_FIELDS, context.prefix, (field) => field.name).map(
    (field): KqlSuggestion => ({
      key: `field-${field.name}`,
      kind: "field",
      label: field.name,
      description: describeField(field),
      field,
      image: null,
      insert: `${field.name}: `,
      start: context.start,
      end: context.end,
    }),
  )

  return context.afterClause ? [...keywords, ...fields] : [...fields, ...keywords]
}

export const getOperatorSuggestions = (
  context: Extract<KqlContext, { kind: "operator" }>,
  describeOperator: (operator: string) => string,
): KqlSuggestion[] =>
  [":", ...(context.field.range === true ? ["<", "<=", ">", ">="] : [])].map((operator) => ({
    key: `operator-${operator}`,
    kind: "operator",
    label: operator,
    description: describeOperator(operator),
    field: context.field,
    image: null,
    insert: `${operator} `,
    start: context.start,
    end: context.end,
  }))

export const getValueSuggestions = (
  context: Extract<KqlContext, { kind: "value" }>,
  values: ReadonlyArray<{ value: string; label: string | null; image: string | null }>,
  anyValueDescription: string,
): KqlSuggestion[] => {
  const matching = byRank(values, context.prefix, (value) => `${value.value} ${value.label ?? ""}`)

  return [
    ...matching.map((value): KqlSuggestion => ({
      key: `value-${value.value}`,
      kind: "value",
      label: value.value,
      description: value.label,
      field: context.field,
      image: value.image,
      insert: `${formatKqlValue(value.value)} `,
      start: context.start,
      end: context.end,
    })),
    ...(context.prefix === "" && context.field.range !== true
      ? [
          {
            key: "value-*",
            kind: "value" as const,
            label: "*",
            description: anyValueDescription,
            field: context.field,
            image: null,
            insert: "* ",
            start: context.start,
            end: context.end,
          },
        ]
      : []),
  ]
}

export const getKqlRoles = (tokens: readonly KqlToken[]): KqlRole[] => {
  const significant = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.type !== "whitespace")
  const roles: KqlRole[] = tokens.map(() => "space")
  let listDepth = 0
  const listStarts: number[] = []

  for (const [position, { token, index }] of significant.entries()) {
    const previous = significant[position - 1]?.token
    const next = significant[position + 1]?.token

    switch (token.type) {
      case "keyword": {
        roles[index] = "keyword"

        break
      }

      case "lparen": {
        const isList = previous?.type === "colon"

        if (isList) {
          listDepth += 1
          listStarts.push(position)
        }

        roles[index] = "paren"

        break
      }

      case "rparen": {
        if (listStarts.length > 0) {
          listStarts.pop()
          listDepth -= 1
        }

        roles[index] = "paren"

        break
      }

      case "colon":

      case "range": {
        roles[index] = "operator"

        break
      }

      case "string": {
        roles[index] = "string"

        break
      }

      case "word": {
        if (next?.type === "colon" || next?.type === "range") {
          roles[index] = "field"
        } else if (token.value === "*") {
          roles[index] = "wildcard"
        } else if (previous?.type === "colon" || previous?.type === "range" || listDepth > 0) {
          roles[index] = "value"
        } else {
          roles[index] = "text"
        }

        break
      }

      case "whitespace": {
        break
      }
    }
  }

  return roles
}
