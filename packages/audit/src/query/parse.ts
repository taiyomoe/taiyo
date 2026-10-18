import { type AuditLogField, getAuditLogField } from "./fields"
import { validateKql } from "./validate"

export type KqlTokenType =
  | "whitespace"
  | "lparen"
  | "rparen"
  | "colon"
  | "range"
  | "string"
  | "word"
  | "keyword"

export type KqlToken = {
  type: KqlTokenType
  text: string
  value: string
  start: number
  end: number
  unterminated?: boolean
}

export type KqlRangeOperator = "<" | "<=" | ">" | ">="

export type KqlValue = { text: string; quoted: boolean; start: number; end: number }

export type KqlNode =
  | { type: "or"; children: KqlNode[] }
  | { type: "and"; children: KqlNode[] }
  | { type: "not"; child: KqlNode }
  | { type: "match"; field: AuditLogField; value: KqlValue }
  | { type: "exists"; field: AuditLogField }
  | { type: "range"; field: AuditLogField; operator: KqlRangeOperator; value: KqlValue }
  | { type: "text"; value: KqlValue }

export type KqlSyntaxError = { message: string; start: number; end: number }

export type KqlParseResult =
  | { ok: true; node: KqlNode | null }
  | { ok: false; error: KqlSyntaxError }

export const KQL_KEYWORDS = ["and", "or", "not"] as const

export const KQL_MAX_LENGTH = 10_000

const MAX_CLAUSES = 300
const SPECIAL_CHARACTERS = new Set(["(", ")", ":", "<", ">", '"'])
const isWhitespace = (char: string) => /\s/.test(char)
const readString = (input: string, start: number): KqlToken => {
  let value = ""
  let index = start + 1

  while (index < input.length) {
    const char = input.charAt(index)

    if (char === "\\" && index + 1 < input.length) {
      value += input.charAt(index + 1)
      index += 2
    } else if (char === '"') {
      return { type: "string", text: input.slice(start, index + 1), value, start, end: index + 1 }
    } else {
      value += char
      index += 1
    }
  }

  return {
    type: "string",
    text: input.slice(start),
    value,
    start,
    end: input.length,
    unterminated: true,
  }
}

export const tokenizeKql = (input: string): KqlToken[] => {
  const tokens: KqlToken[] = []
  let index = 0

  while (index < input.length) {
    const char = input.charAt(index)
    const start = index

    if (isWhitespace(char)) {
      while (index < input.length && isWhitespace(input.charAt(index))) {
        index += 1
      }

      const text = input.slice(start, index)

      tokens.push({ type: "whitespace", text, value: text, start, end: index })
    } else if (char === '"') {
      const token = readString(input, start)

      tokens.push(token)
      index = token.end
    } else if (char === "(" || char === ")") {
      tokens.push({
        type: char === "(" ? "lparen" : "rparen",
        text: char,
        value: char,
        start,
        end: start + 1,
      })
      index += 1
    } else if (char === ":") {
      tokens.push({ type: "colon", text: char, value: char, start, end: start + 1 })
      index += 1
    } else if (char === "<" || char === ">") {
      const text = input.charAt(index + 1) === "=" ? `${char}=` : char

      tokens.push({ type: "range", text, value: text, start, end: start + text.length })
      index += text.length
    } else {
      while (
        index < input.length &&
        !isWhitespace(input.charAt(index)) &&
        !SPECIAL_CHARACTERS.has(input.charAt(index))
      ) {
        index += 1
      }

      const text = input.slice(start, index)
      const lower = text.toLowerCase()
      const isKeyword = KQL_KEYWORDS.some((keyword) => keyword === lower)

      tokens.push({
        type: isKeyword ? "keyword" : "word",
        text,
        value: isKeyword ? lower : text,
        start,
        end: index,
      })
    }
  }

  return tokens
}

class ParseFailure extends Error {
  readonly start: number
  readonly end: number

  constructor(message: string, start: number, end: number) {
    super(message)
    this.start = start
    this.end = end
  }
}

const isRangeOperator = (value: string): value is KqlRangeOperator =>
  value === "<" || value === "<=" || value === ">" || value === ">="

export const parseKql = (input: string): KqlParseResult => {
  if (input.length > KQL_MAX_LENGTH) {
    return {
      ok: false,
      error: { message: "The query is too long.", start: KQL_MAX_LENGTH, end: input.length },
    }
  }

  const tokens = tokenizeKql(input).filter((token) => token.type !== "whitespace")
  let index = 0
  let clauses = 0
  const peek = () => tokens[index]
  const fail = (message: string, token?: KqlToken): never => {
    throw new ParseFailure(message, token?.start ?? input.length, token?.end ?? input.length)
  }
  const take = () => {
    const token = tokens[index]

    index += 1

    return token
  }
  const isKeyword = (token: KqlToken | undefined, keyword: string) =>
    token?.type === "keyword" && token.value === keyword
  const startsTerm = (token: KqlToken | undefined) =>
    token !== undefined &&
    (token.type === "word" ||
      token.type === "string" ||
      token.type === "lparen" ||
      isKeyword(token, "not"))
  const toValue = (token: KqlToken): KqlValue => {
    if (token.unterminated === true) {
      fail("Missing closing quote.", token)
    }

    clauses += 1

    if (clauses > MAX_CLAUSES) {
      fail(`A query can have at most ${MAX_CLAUSES} terms.`, token)
    }

    return {
      text: token.value,
      quoted: token.type === "string",
      start: token.start,
      end: token.end,
    }
  }
  const expectClose = (open: KqlToken) => {
    if (take()?.type !== "rparen") {
      fail("Missing closing parenthesis.", open)
    }
  }
  const parseList = (parseItem: () => KqlNode, combine: "and" | "or"): KqlNode => {
    const children = [parseItem()]

    for (;;) {
      const token = peek()

      if (isKeyword(token, combine)) {
        take()

        if (!startsTerm(peek())) {
          fail(`Expected a term after "${token?.text ?? combine}".`, token)
        }

        children.push(parseItem())
      } else if (combine === "and" && startsTerm(token)) {
        children.push(parseItem())
      } else {
        break
      }
    }

    const [first] = children

    return children.length === 1 && first !== undefined ? first : { type: combine, children }
  }
  const parseValues = (field: AuditLogField): KqlNode => {
    const parseValueNot = (): KqlNode => {
      const token = take()

      if (token === undefined) {
        return fail(`Expected a value for "${field.name}".`)
      }

      if (isKeyword(token, "not")) {
        return { type: "not", child: parseValueNot() }
      }

      if (token.type === "lparen") {
        const node = parseList(() => parseList(parseValueNot, "and"), "or")

        expectClose(token)

        return node
      }

      if (token.type !== "word" && token.type !== "string") {
        return fail(`Expected a value for "${field.name}".`, token)
      }

      return { type: "match", field, value: toValue(token) }
    }

    return parseList(() => parseList(parseValueNot, "and"), "or")
  }
  const parseField = (field: AuditLogField, operator: KqlToken): KqlNode => {
    const token = peek()

    if (operator.type === "range") {
      if (field.range !== true || !isRangeOperator(operator.value)) {
        return fail(`"${field.name}" can't be compared with ${operator.text}.`, operator)
      }

      take()

      if (token === undefined || (token.type !== "word" && token.type !== "string")) {
        return fail(`Expected a value after "${field.name} ${operator.text}".`, token ?? operator)
      }

      return { type: "range", field, operator: operator.value, value: toValue(token) }
    }

    if (token?.type === "lparen") {
      take()

      const node = parseValues(field)

      expectClose(token)

      return node
    }

    if (token?.type === "word" && token.value === "*") {
      take()
      toValue(token)

      return { type: "exists", field }
    }

    if (token === undefined || (token.type !== "word" && token.type !== "string")) {
      return fail(`Expected a value after "${field.name}:".`, token ?? operator)
    }

    take()

    return { type: "match", field, value: toValue(token) }
  }
  const parsePrimary = (): KqlNode => {
    const token = take()

    if (token === undefined) {
      return fail("Expected a term.")
    }

    if (token.type === "lparen") {
      const node = parseList(() => parseList(parseNot, "and"), "or")

      expectClose(token)

      return node
    }

    if (token.type === "word") {
      const operator = peek()

      if (operator?.type === "colon" || operator?.type === "range") {
        const field = getAuditLogField(token.value)

        if (field === undefined) {
          return fail(`Unknown field "${token.value}".`, token)
        }

        take()

        return parseField(field, operator)
      }
    }

    if (token.type !== "word" && token.type !== "string") {
      return fail(`Unexpected "${token.text}".`, token)
    }

    return { type: "text", value: toValue(token) }
  }
  const parseNot = (): KqlNode => {
    const token = peek()

    if (isKeyword(token, "not")) {
      take()

      if (!startsTerm(peek())) {
        fail('Expected a term after "not".', token)
      }

      return { type: "not", child: parseNot() }
    }

    return parsePrimary()
  }

  try {
    if (tokens.length === 0) {
      return { ok: true, node: null }
    }

    const node = parseList(() => parseList(parseNot, "and"), "or")
    const extra = peek()

    if (extra !== undefined) {
      fail(`Unexpected "${extra.text}".`, extra)
    }

    const invalid = validateKql(node)

    return invalid === null ? { ok: true, node } : { ok: false, error: invalid }
  } catch (error) {
    if (error instanceof ParseFailure) {
      return { ok: false, error: { message: error.message, start: error.start, end: error.end } }
    }

    throw error
  }
}

export const quoteKqlValue = (value: string) =>
  `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`
