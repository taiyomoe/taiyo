import { describe, expect, it } from "vitest"
import { toUnixMs } from "../to-unix-ms"

describe("toUnixMs", () => {
  it("should return null for null", () => {
    expect(toUnixMs(null)).toBe(null)
  })

  it("should return null for undefined", () => {
    expect(toUnixMs(undefined)).toBe(null)
  })

  it("should convert Date instances to unix ms", () => {
    const date = new Date("2024-01-01T00:00:00.000Z")

    expect(toUnixMs(date)).toBe(date.getTime())
    expect(toUnixMs(date)).toBe(1704067200000)
  })

  it("should convert the epoch Date to 0", () => {
    expect(toUnixMs(new Date(0))).toBe(0)
  })

  it("should convert ISO date strings to unix ms", () => {
    expect(toUnixMs("2024-01-01T00:00:00.000Z")).toBe(1704067200000)
    expect(toUnixMs("1970-01-01T00:00:00.000Z")).toBe(0)
  })

  it("should convert numeric timestamps to unix ms", () => {
    expect(toUnixMs(1704067200000)).toBe(1704067200000)
    expect(toUnixMs(0)).toBe(0)
  })

  it("should return NaN for invalid date strings", () => {
    expect(toUnixMs("not a date")).toBeNaN()
  })

  it("should return null for unsupported types", () => {
    expect(toUnixMs({})).toBe(null)
    expect(toUnixMs([])).toBe(null)
    expect(toUnixMs(true)).toBe(null)
    expect(toUnixMs(false)).toBe(null)
    expect(toUnixMs(Symbol("x"))).toBe(null)
    expect(toUnixMs(() => 0)).toBe(null)
  })
})
