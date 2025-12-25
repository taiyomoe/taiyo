import { describe, expect, it } from "vitest"
import { toDemography } from "../to-demography"

describe("toDemography", () => {
  it("should return SHOUNEN for 'shounen'", () => {
    expect(toDemography("shounen")).toBe("SHOUNEN")
  })

  it("should return SHOUJO for 'shoujo'", () => {
    expect(toDemography("shoujo")).toBe("SHOUJO")
  })

  it("should return JOSEI for 'josei'", () => {
    expect(toDemography("josei")).toBe("JOSEI")
  })

  it("should return SEINEN for 'seinen'", () => {
    expect(toDemography("seinen")).toBe("SEINEN")
  })

  it("should return SHOUNEN for unknown values", () => {
    expect(toDemography("unknown")).toBe("SHOUNEN")
    expect(toDemography("")).toBe("SHOUNEN")
    expect(toDemography("random")).toBe("SHOUNEN")
  })

  it("should be case insensitive", () => {
    expect(toDemography("SHOUNEN")).toBe("SHOUNEN")
    expect(toDemography("Shounen")).toBe("SHOUNEN")
    expect(toDemography("SHOUJO")).toBe("SHOUJO")
    expect(toDemography("Shoujo")).toBe("SHOUJO")
    expect(toDemography("JOSEI")).toBe("JOSEI")
    expect(toDemography("Josei")).toBe("JOSEI")
    expect(toDemography("SEINEN")).toBe("SEINEN")
    expect(toDemography("Seinen")).toBe("SEINEN")
  })
})

