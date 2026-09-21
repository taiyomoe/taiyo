import { describe, expect, it } from "vitest"
import { toCountryOfOrigin } from "../to-country-of-origin"

describe("toCountryOfOrigin", () => {
  it("should return KOREA for 'ko'", () => {
    expect(toCountryOfOrigin("ko")).toBe("KOREA")
  })

  it("should return CHINA for 'zh'", () => {
    expect(toCountryOfOrigin("zh")).toBe("CHINA")
  })

  it("should return CHINA for 'zh_hk'", () => {
    expect(toCountryOfOrigin("zh_hk")).toBe("CHINA")
  })

  it("should return USA for 'en'", () => {
    expect(toCountryOfOrigin("en")).toBe("USA")
  })

  it("should return FRANCE for 'fr'", () => {
    expect(toCountryOfOrigin("fr")).toBe("FRANCE")
  })

  it("should return BRAZIL for 'pt_br'", () => {
    expect(toCountryOfOrigin("pt_br")).toBe("BRAZIL")
  })

  it("should return JAPAN for Japanese language", () => {
    expect(toCountryOfOrigin("ja")).toBe("JAPAN")
  })

  it("should return JAPAN for unknown languages", () => {
    expect(toCountryOfOrigin("de")).toBe("JAPAN")
    expect(toCountryOfOrigin("es")).toBe("JAPAN")
    expect(toCountryOfOrigin("unknown")).toBe("JAPAN")
    expect(toCountryOfOrigin("")).toBe("JAPAN")
  })

  it("should be case insensitive", () => {
    expect(toCountryOfOrigin("KO")).toBe("KOREA")
    expect(toCountryOfOrigin("Ko")).toBe("KOREA")
    expect(toCountryOfOrigin("ZH")).toBe("CHINA")
    expect(toCountryOfOrigin("Zh")).toBe("CHINA")
    expect(toCountryOfOrigin("ZH_HK")).toBe("CHINA")
    expect(toCountryOfOrigin("Zh_Hk")).toBe("CHINA")
    expect(toCountryOfOrigin("EN")).toBe("USA")
    expect(toCountryOfOrigin("En")).toBe("USA")
    expect(toCountryOfOrigin("FR")).toBe("FRANCE")
    expect(toCountryOfOrigin("Fr")).toBe("FRANCE")
    expect(toCountryOfOrigin("PT_BR")).toBe("BRAZIL")
    expect(toCountryOfOrigin("Pt_Br")).toBe("BRAZIL")
  })
})
