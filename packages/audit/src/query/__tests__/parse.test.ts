import { describe, expect, it } from "vitest"
import { parseKql, quoteKqlValue, tokenizeKql } from "../parse"

const parse = (input: string) => {
  const result = parseKql(input)

  if (!result.ok) {
    throw new Error(result.error.message)
  }

  return result.node
}
const failure = (input: string) => {
  const result = parseKql(input)

  return result.ok ? null : result.error
}

describe("parseKql", () => {
  it("returns no node for an empty query", () => {
    expect(parse("   ")).toBeNull()
  })

  it("parses a field match", () => {
    expect(parse("outcome: denied")).toMatchObject({
      type: "match",
      field: { name: "outcome" },
      value: { text: "denied", quoted: false },
    })
  })

  it("parses quoted values with escapes", () => {
    expect(parse('reason: "say \\"hi\\""')).toMatchObject({
      type: "match",
      value: { text: 'say "hi"', quoted: true },
    })
  })

  it("gives and precedence over or", () => {
    expect(parse("a or b and c")).toMatchObject({
      type: "or",
      children: [{ type: "text" }, { type: "and", children: [{}, {}] }],
    })
  })

  it("treats juxtaposed terms as and", () => {
    expect(parse("action: media.* outcome: success")).toMatchObject({
      type: "and",
      children: [{ field: { name: "action" } }, { field: { name: "outcome" } }],
    })
  })

  it("parses not, groups and value lists", () => {
    expect(parse("not (actor: vitor or category: (auth or admin))")).toMatchObject({
      type: "not",
      child: {
        type: "or",
        children: [
          { type: "match", field: { name: "actor" } },
          {
            type: "or",
            children: [
              { type: "match", field: { name: "category" }, value: { text: "auth" } },
              { type: "match", field: { name: "category" }, value: { text: "admin" } },
            ],
          },
        ],
      },
    })
  })

  it("parses ranges and exists", () => {
    expect(parse("severity >= high and target.mediaId: *")).toMatchObject({
      type: "and",
      children: [
        { type: "range", operator: ">=", value: { text: "high" } },
        { type: "exists", field: { name: "target.mediaId" } },
      ],
    })
  })

  it("resolves field aliases", () => {
    expect(parse("user: admin")).toMatchObject({ field: { name: "actor" } })
  })

  it("keywords are case-insensitive", () => {
    expect(parse("a AND NOT b")).toMatchObject({
      type: "and",
      children: [{ type: "text" }, { type: "not" }],
    })
  })

  it("reports unknown fields at their position", () => {
    expect(failure("outcome: x and color: red")).toEqual({
      message: 'Unknown field "color".',
      start: 15,
      end: 20,
    })
  })

  it("reports a range on a field that has no order", () => {
    expect(failure("actor > b")?.message).toBe('"actor" can\'t be compared with >.')
  })

  it("reports values a field can't take", () => {
    expect(failure("outcome: maybe")).toEqual({
      message: '"maybe" is not a valid outcome. Use one of: success, failure, denied.',
      start: 9,
      end: 14,
    })
    expect(failure("status >= lots")?.message).toBe('"status" takes a whole number, not "lots".')
    expect(failure("timestamp: 2026-10-01")?.message).toBe(
      'Compare "timestamp" with <, <=, > or >=.',
    )
    expect(failure("outcome: s* and severity > HIGH")).toBeNull()
  })

  it("reports missing values, parentheses and quotes", () => {
    expect(failure("outcome:")?.message).toBe('Expected a value after "outcome:".')
    expect(failure("(a or b")?.message).toBe("Missing closing parenthesis.")
    expect(failure('reason: "open')?.message).toBe("Missing closing quote.")
    expect(failure("a and")?.message).toBe('Expected a term after "and".')
    expect(failure("a )")?.message).toBe('Unexpected ")".')
  })
})

describe("tokenizeKql", () => {
  it("keeps whitespace so the text can be rebuilt", () => {
    const input = 'actor: "a b" and  ip >= 1'

    expect(
      tokenizeKql(input)
        .map((token) => token.text)
        .join(""),
    ).toBe(input)
  })
})

describe("quoteKqlValue", () => {
  it("round-trips through the parser", () => {
    const value = 'a "quoted" \\ value'

    expect(parse(`reason: ${quoteKqlValue(value)}`)).toMatchObject({ value: { text: value } })
  })
})
