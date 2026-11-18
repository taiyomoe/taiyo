import { describe, expect, it } from "vitest"
import { getRankingPeriodEnd, getRankingPeriodStart } from "../rankings"

const at = (iso: string) => new Date(iso)

describe("getRankingPeriodStart", () => {
  it("starts days at UTC midnight", () => {
    expect(getRankingPeriodStart("DAY", at("2026-11-18T23:59:59.999Z"))).toEqual(
      at("2026-11-18T00:00:00.000Z"),
    )
  })

  it("starts weeks on Monday, Sundays included", () => {
    expect(getRankingPeriodStart("WEEK", at("2026-11-16T00:00:00.000Z"))).toEqual(
      at("2026-11-16T00:00:00.000Z"),
    )
    expect(getRankingPeriodStart("WEEK", at("2026-11-22T23:00:00.000Z"))).toEqual(
      at("2026-11-16T00:00:00.000Z"),
    )
  })

  it("starts months on the 1st", () => {
    expect(getRankingPeriodStart("MONTH", at("2026-12-31T12:00:00.000Z"))).toEqual(
      at("2026-12-01T00:00:00.000Z"),
    )
  })
})

describe("getRankingPeriodEnd", () => {
  it("ends each period where the next one starts", () => {
    expect(getRankingPeriodEnd("DAY", at("2026-11-18T00:00:00.000Z"))).toEqual(
      at("2026-11-19T00:00:00.000Z"),
    )
    expect(getRankingPeriodEnd("WEEK", at("2026-12-28T00:00:00.000Z"))).toEqual(
      at("2027-01-04T00:00:00.000Z"),
    )
    expect(getRankingPeriodEnd("MONTH", at("2026-12-01T00:00:00.000Z"))).toEqual(
      at("2027-01-01T00:00:00.000Z"),
    )
    expect(getRankingPeriodEnd("MONTH", at("2027-02-01T00:00:00.000Z"))).toEqual(
      at("2027-03-01T00:00:00.000Z"),
    )
  })
})
