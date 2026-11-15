import { describe, expect, it } from "vitest"
import { toLocalizedText } from "../to-localized-text"

describe("toLocalizedText", () => {
  it("should keep valid language keys", () => {
    const input = { en: "Hello", pt_br: "Olá", ja: "こんにちは" }
    const result = toLocalizedText(input)

    expect(result).toEqual({ en: "Hello", pt_br: "Olá", ja: "こんにちは" })
  })

  it("should remove invalid language keys", () => {
    const input = { en: "Hello", invalid: "test", foo: "bar" }
    const result = toLocalizedText(input)

    expect(result).toEqual({ en: "Hello" })
    expect(result).not.toHaveProperty("invalid")
    expect(result).not.toHaveProperty("foo")
  })

  it("should handle empty object", () => {
    const result = toLocalizedText({})

    expect(result).toEqual({})
  })

  it("should handle object with only invalid keys", () => {
    const input = { invalid: "test", foo: "bar", baz: "qux" }
    const result = toLocalizedText(input)

    expect(result).toEqual({})
  })

  it("should handle mixed valid and invalid keys", () => {
    const input = {
      en: "English",
      fr: "French",
      invalidKey: "should be removed",
      de: "German",
      anotherInvalid: "also removed",
    }
    const result = toLocalizedText(input)

    expect(result).toEqual({ en: "English", fr: "French", de: "German" })
  })

  it("should preserve string values for valid language keys", () => {
    const input = { en: "Hello World", pt_br: "Olá Mundo" }
    const result = toLocalizedText(input)

    expect(result.en).toBe("Hello World")
    expect(result.pt_br).toBe("Olá Mundo")
  })

  it("should handle romanized language variants", () => {
    const input = {
      ja: "日本語",
      ja_ro: "Nihongo",
      ko: "한국어",
      ko_ro: "Hangugeo",
    }
    const result = toLocalizedText(input)

    expect(result).toEqual({
      ja: "日本語",
      ja_ro: "Nihongo",
      ko: "한국어",
      ko_ro: "Hangugeo",
    })
  })

  it("should handle regional language variants", () => {
    const input = {
      pt_br: "Português BR",
      pt_pt: "Português PT",
      es: "Español",
      es_la: "Español LA",
    }
    const result = toLocalizedText(input)

    expect(result).toEqual({
      pt_br: "Português BR",
      pt_pt: "Português PT",
      es: "Español",
      es_la: "Español LA",
    })
  })

  it("should handle Chinese variants", () => {
    const input = { zh: "中文", zh_hk: "中文 (香港)", zh_ro: "Zhongwen" }
    const result = toLocalizedText(input)

    expect(result).toEqual({
      zh: "中文",
      zh_hk: "中文 (香港)",
      zh_ro: "Zhongwen",
    })
  })
})
