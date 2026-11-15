import { describe, expect, it } from "vitest"
import { toType } from "../to-type"

describe("toType", () => {
  it("should return MANHWA for Korean language", () => {
    expect(toType("ko")).toBe("MANHWA")
  })

  it("should return MANHWA for English language", () => {
    expect(toType("en")).toBe("MANHWA")
  })

  it("should return MANHUA for Chinese language", () => {
    expect(toType("zh")).toBe("MANHUA")
  })

  it("should return MANHUA for Chinese (Hong Kong) language", () => {
    expect(toType("zh_hk")).toBe("MANHUA")
  })

  it("should return MANGA for Japanese language", () => {
    expect(toType("ja")).toBe("MANGA")
  })

  it("should return MANGA for unknown languages", () => {
    expect(toType("fr")).toBe("MANGA")
    expect(toType("de")).toBe("MANGA")
    expect(toType("pt_br")).toBe("MANGA")
    expect(toType("unknown")).toBe("MANGA")
    expect(toType("")).toBe("MANGA")
  })

  it("should be case insensitive", () => {
    expect(toType("KO")).toBe("MANHWA")
    expect(toType("Ko")).toBe("MANHWA")
    expect(toType("EN")).toBe("MANHWA")
    expect(toType("En")).toBe("MANHWA")
    expect(toType("ZH")).toBe("MANHUA")
    expect(toType("Zh")).toBe("MANHUA")
    expect(toType("ZH_HK")).toBe("MANHUA")
    expect(toType("Zh_Hk")).toBe("MANHUA")
  })
})
