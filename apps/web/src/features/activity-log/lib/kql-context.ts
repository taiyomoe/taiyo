import { type AuditLogField, getAuditLogField, tokenizeKql } from "@taiyomoe/audit/query"

export type KqlContext =
  | { kind: "term"; prefix: string; start: number; end: number; afterClause: boolean }
  | { kind: "operator"; field: AuditLogField; start: number; end: number }
  | { kind: "value"; field: AuditLogField; prefix: string; start: number; end: number }
  | { kind: "none" }

const EDITABLE_TOKENS = new Set(["word", "keyword", "string"])

export const getKqlContext = (text: string, cursor: number) => {
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
  let prefix = ""

  if (current !== undefined) {
    prefix = current.type === "string" ? current.value : text.slice(current.start, cursor)
  }

  if (last?.type === "colon" || last?.type === "range") {
    const field = secondLast?.type === "word" ? getAuditLogField(secondLast.value) : undefined

    return (
      field === undefined ? { kind: "none" } : { kind: "value", field, prefix, start, end }
    ) satisfies KqlContext
  }

  if (listField !== null && (last?.type === "lparen" || last?.type === "keyword")) {
    return { kind: "value", field: listField, prefix, start, end } satisfies KqlContext
  }

  if (
    current === undefined &&
    last?.type === "word" &&
    secondLast?.type !== "colon" &&
    secondLast?.type !== "range"
  ) {
    const field = getAuditLogField(last.value)

    if (field !== undefined) {
      return { kind: "operator", field, start: cursor, end: cursor } satisfies KqlContext
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
  } satisfies KqlContext
}
