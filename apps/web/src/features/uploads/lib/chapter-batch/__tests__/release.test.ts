import { describe, expect, it } from "vitest"
import { DEFAULT_RELEASE, planRelease } from "../release"

const NOW = Date.UTC(2026, 9, 22, 12)
const HOUR = 3_600_000
const DAY = 24 * HOUR

describe("planRelease", () => {
  it("releases right away by default", () => {
    const plan = planRelease(DEFAULT_RELEASE, NOW)

    expect(plan.error).toBeNull()
    expect(plan.at(3)).toBeNull()
  })

  it("starts every chapter at the picked date", () => {
    const date = new Date(NOW + 2 * DAY)
    const plan = planRelease({ ...DEFAULT_RELEASE, mode: "date", date }, NOW)

    expect(plan.error).toBeNull()
    expect(plan.at(0)).toEqual(date)
    expect(plan.at(4)).toEqual(date)
  })

  it("spaces chapters out from the start", () => {
    const plan = planRelease(
      {
        ...DEFAULT_RELEASE,
        mode: "delay",
        delay: "6",
        delayUnit: "hours",
        spaced: true,
        spacing: "1,5",
        spacingUnit: "days",
      },
      NOW,
    )

    expect(plan.at(0)?.getTime()).toBe(NOW + 6 * HOUR)
    expect(plan.at(2)?.getTime()).toBe(NOW + 6 * HOUR + 3 * DAY)
  })

  it.each([
    [{ mode: "date" as const, date: null }],
    [{ mode: "date" as const, date: new Date(NOW - HOUR) }],
    [{ mode: "delay" as const, delay: "0" }],
    [{ mode: "delay" as const, delay: "" }],
    [{ mode: "date" as const, date: new Date(NOW + DAY), spaced: true, spacing: "-1" }],
  ])("refuses %o", (settings) => {
    const plan = planRelease({ ...DEFAULT_RELEASE, ...settings }, NOW)

    expect(plan.error).not.toBeNull()
    expect(plan.at(0)).toBeNull()
  })
})
