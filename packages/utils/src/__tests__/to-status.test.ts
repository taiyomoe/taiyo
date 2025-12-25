import { describe, expect, it } from "vitest"
import { toStatus } from "../to-status"

describe("toStatus", () => {
  it("should return RELEASING for 'ongoing'", () => {
    expect(toStatus("ongoing")).toBe("RELEASING")
  })

  it("should return HIATUS for 'hiatus'", () => {
    expect(toStatus("hiatus")).toBe("HIATUS")
  })

  it("should return FINISHED for 'completed'", () => {
    expect(toStatus("completed")).toBe("FINISHED")
  })

  it("should return CANCELLED for 'cancelled'", () => {
    expect(toStatus("cancelled")).toBe("CANCELLED")
  })

  it("should return CANCELLED for unknown values", () => {
    expect(toStatus("unknown")).toBe("CANCELLED")
    expect(toStatus("")).toBe("CANCELLED")
    expect(toStatus("random")).toBe("CANCELLED")
  })

  it("should be case insensitive", () => {
    expect(toStatus("ONGOING")).toBe("RELEASING")
    expect(toStatus("Ongoing")).toBe("RELEASING")
    expect(toStatus("HIATUS")).toBe("HIATUS")
    expect(toStatus("Hiatus")).toBe("HIATUS")
    expect(toStatus("COMPLETED")).toBe("FINISHED")
    expect(toStatus("Completed")).toBe("FINISHED")
    expect(toStatus("CANCELLED")).toBe("CANCELLED")
    expect(toStatus("Cancelled")).toBe("CANCELLED")
  })
})

