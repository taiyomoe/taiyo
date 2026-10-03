import { describe, expect, it } from "vitest"
import { toLanguage } from "../to-language"

describe("toLanguage", () => {
  it("should convert ja-ro to ja_ro", () => {
    expect(toLanguage("ja-ro")).toBe("ja_ro")
  })

  it("should convert ko-ro to ko_ro", () => {
    expect(toLanguage("ko-ro")).toBe("ko_ro")
  })

  it("should convert zh-ro to zh_ro", () => {
    expect(toLanguage("zh-ro")).toBe("zh_ro")
  })

  it("should convert zh-hk to zh_hk", () => {
    expect(toLanguage("zh-hk")).toBe("zh_hk")
  })

  it("should convert pt to pt_pt", () => {
    expect(toLanguage("pt")).toBe("pt_pt")
  })

  it("should convert pt-br to pt_br", () => {
    expect(toLanguage("pt-br")).toBe("pt_br")
  })

  it("should convert es-la to es_la", () => {
    expect(toLanguage("es-la")).toBe("es_la")
  })

  it("should return valid Languages enum values as-is", () => {
    expect(toLanguage("en")).toBe("en")
    expect(toLanguage("ja")).toBe("ja")
    expect(toLanguage("ko")).toBe("ko")
    expect(toLanguage("fr")).toBe("fr")
    expect(toLanguage("es")).toBe("es")
    expect(toLanguage("zh")).toBe("zh")
  })

  it("should return null for invalid language codes", () => {
    expect(toLanguage("invalid")).toBeNull()
    expect(toLanguage("xx")).toBeNull()
    expect(toLanguage("")).toBeNull()
  })

  it("should return null for null input", () => {
    expect(toLanguage(null)).toBeNull()
  })

  it("should handle underscore variants that exist in Languages", () => {
    expect(toLanguage("pt_br")).toBe("pt_br")
    expect(toLanguage("pt_pt")).toBe("pt_pt")
    expect(toLanguage("es_la")).toBe("es_la")
    expect(toLanguage("zh_hk")).toBe("zh_hk")
    expect(toLanguage("ja_ro")).toBe("ja_ro")
    expect(toLanguage("ko_ro")).toBe("ko_ro")
    expect(toLanguage("zh_ro")).toBe("zh_ro")
  })
})
