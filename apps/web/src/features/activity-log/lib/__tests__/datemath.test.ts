import { describe, expect, it } from "vitest"
import { parseDateMath, resolveDateMath, resolveDateRange, toDateMath } from "../datemath"

const NOW = new Date(2026, 9, 17, 14, 30, 45, 500).getTime()

describe("parseDateMath", () => {
  it("parses relative expressions", () => {
    expect(parseDateMath("now")).toEqual({ kind: "relative", amount: 0, unit: "m", round: null })
    expect(parseDateMath("now-15m")).toEqual({
      kind: "relative",
      amount: -15,
      unit: "m",
      round: null,
    })
    expect(parseDateMath("now+2d/d")).toEqual({
      kind: "relative",
      amount: 2,
      unit: "d",
      round: "d",
    })
  })

  it("parses absolute dates and rejects anything else", () => {
    expect(parseDateMath("2026-10-01T10:00:00.000Z")).toMatchObject({ kind: "absolute" })
    expect(parseDateMath("yesterday")).toBeNull()
    expect(parseDateMath("now-5q")).toBeNull()
  })
})

describe("resolveDateMath", () => {
  it("shifts from now", () => {
    expect(resolveDateMath("now-90m", { now: NOW })).toEqual(new Date(2026, 9, 17, 13, 0, 45, 500))
    expect(resolveDateMath("now-1M", { now: NOW })).toEqual(new Date(2026, 8, 17, 14, 30, 45, 500))
  })

  it("rounds down, or up to the next unit for an end", () => {
    expect(resolveDateMath("now/d", { now: NOW })).toEqual(new Date(2026, 9, 17))
    expect(resolveDateMath("now/d", { now: NOW, roundUp: true })).toEqual(new Date(2026, 9, 18))
    expect(resolveDateMath("now-1d/d", { now: NOW })).toEqual(new Date(2026, 9, 16))
  })

  it("starts weeks on Monday", () => {
    expect(resolveDateMath("now/w", { now: NOW })).toEqual(new Date(2026, 9, 12))
  })
})

describe("resolveDateRange", () => {
  it("rejects an empty or inverted range", () => {
    expect(resolveDateRange("now", "now-1h", NOW)).toBeNull()
    expect(resolveDateRange("now-1h", "now", NOW)).not.toBeNull()
  })
})

describe("toDateMath", () => {
  it("builds expressions back", () => {
    expect(toDateMath({ amount: -15, unit: "m", round: null })).toBe("now-15m")
    expect(toDateMath({ amount: 0, unit: "d", round: "d" })).toBe("now/d")
    expect(toDateMath({ amount: 3, unit: "h", round: "h" })).toBe("now+3h/h")
  })
})
