import { describe, expect, it } from "vitest"
import { highlightRichText } from "../rich-text-highlight"

const describeSegments = (source: string) =>
  highlightRichText(source).map((segment) => [
    source.slice(segment.start, segment.end),
    segment.syntax ? "syntax" : segment.marks.join("+") || "plain",
  ])
const expectContiguous = (source: string) => {
  const segments = highlightRichText(source)
  let cursor = 0

  for (const segment of segments) {
    expect(segment.start).toBe(cursor)
    cursor = segment.end
  }

  expect(cursor).toBe(source.length)
}

describe("highlightRichText", () => {
  it("keeps markers visible and styles the text between them", () => {
    expect(describeSegments("a **b** __c__ ~~d~~ *e*")).toEqual([
      ["a ", "plain"],
      ["**", "syntax"],
      ["b", "bold"],
      ["**", "syntax"],
      [" ", "plain"],
      ["__", "syntax"],
      ["c", "underline"],
      ["__", "syntax"],
      [" ", "plain"],
      ["~~", "syntax"],
      ["d", "strike"],
      ["~~", "syntax"],
      [" ", "plain"],
      ["*", "syntax"],
      ["e", "italic"],
      ["*", "syntax"],
    ])
  })

  it("nests formats", () => {
    expect(describeSegments("**a __b__**")).toEqual([
      ["**", "syntax"],
      ["a ", "bold"],
      ["__", "syntax"],
      ["b", "bold+underline"],
      ["__", "syntax"],
      ["**", "syntax"],
    ])
  })

  it("highlights spoilers and masked links", () => {
    expect(describeSegments("||a|| [**b**](https://taiyo.moe)")).toEqual([
      ["||", "syntax"],
      ["a", "spoiler"],
      ["||", "syntax"],
      [" ", "plain"],
      ["[", "syntax"],
      ["**", "syntax"],
      ["b", "link+bold"],
      ["**", "syntax"],
      ["](https://taiyo.moe)", "syntax"],
    ])
    expect(describeSegments("[a](javascript:x)")).toEqual([["[a](javascript:x)", "plain"]])
  })

  it("leaves unmatched, escaped and intraword markers as text", () => {
    expect(describeSegments("**open")).toEqual([["**open", "plain"]])
    expect(describeSegments("snake_case_name")).toEqual([["snake_case_name", "plain"]])
    expect(describeSegments("\\*a*")).toEqual([
      ["\\", "syntax"],
      ["*a*", "plain"],
    ])
  })

  it("does not carry formatting across blank lines", () => {
    expect(describeSegments("**a\n\nb**")).toEqual([
      ["**a", "plain"],
      ["\n\nb**", "plain"],
    ])
  })

  it("covers the whole source and stays fast on pathological input", () => {
    for (const source of [
      "*".repeat(20_000),
      "_a".repeat(10_000),
      "**a ".repeat(5000),
      `${"*".repeat(10_000)}a${"*".repeat(10_000)}`,
      "~".repeat(20_000),
      "\\".repeat(20_000),
      "[".repeat(20_000),
      "||".repeat(10_000),
    ]) {
      const started = performance.now()

      expectContiguous(source)
      expect(performance.now() - started).toBeLessThan(500)
    }
  })
})
