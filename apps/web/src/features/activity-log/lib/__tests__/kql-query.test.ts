import { describe, expect, test } from "vitest"
import { andClauses, DEFAULT_QUERY, matchClause } from "../kql-query"

describe("andClauses", () => {
  test("appends a clause to the default query", () => {
    expect(andClauses(DEFAULT_QUERY, [matchClause("action", "media.UPDATE")])).toBe(
      'not category: "audit" and action: "media.UPDATE"',
    )
  })

  test("replaces the opposite clause instead of stacking both", () => {
    expect(
      andClauses(`${DEFAULT_QUERY} and action: "media.UPDATE"`, [
        matchClause("action", "media.UPDATE", true),
      ]),
    ).toBe('not category: "audit" and not action: "media.UPDATE"')
    expect(andClauses(DEFAULT_QUERY, [matchClause("category", "audit")])).toBe('category: "audit"')
  })

  test("wraps a top-level or before appending", () => {
    expect(andClauses("a or b", [matchClause("outcome", "denied")])).toBe(
      '(a or b) and outcome: "denied"',
    )
  })

  test("keeps nested groups and escapes values", () => {
    expect(andClauses('(x or y) and actor.id: "1"', [matchClause("ip", 'a"b')])).toBe(
      '(x or y) and actor.id: "1" and ip: "a\\"b"',
    )
  })

  test("starts a fresh query from an empty one", () => {
    expect(andClauses("", ["not ip: *"])).toBe("not ip: *")
  })
})
