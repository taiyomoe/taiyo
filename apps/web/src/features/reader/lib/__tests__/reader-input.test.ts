import { describe, expect, it } from "vitest"
import { getSideStep, getZoneAction } from "../reader-input"

describe("getZoneAction", () => {
  it("maps the left side to the previous page when reading left to right", () => {
    expect(getZoneAction(0.2, "sides", "ltr")).toBe("prev")
    expect(getZoneAction(0.6, "sides", "ltr")).toBe("next")
  })

  it("mirrors the sides when reading right to left", () => {
    expect(getZoneAction(0.2, "sides", "rtl")).toBe("next")
    expect(getSideStep("right", "rtl")).toBe("prev")
  })

  it("opens the menu from the middle third", () => {
    expect(getZoneAction(0.5, "thirds", "ltr")).toBe("menu")
    expect(getZoneAction(0.9, "thirds", "ltr")).toBe("next")
  })

  it("ignores clicks when zones are off", () => {
    expect(getZoneAction(0.1, "off", "ltr")).toBeNull()
  })
})
