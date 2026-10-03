import { describe, expect, it } from "vitest"
import { coerceFormDataValue } from "../coerce-form-data-value"

describe("coerceFormDataValue", () => {
  it("should return File instances as-is", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" })

    expect(coerceFormDataValue(file)).toBe(file)
    expect(coerceFormDataValue(file) instanceof File).toBe(true)
  })

  it("should convert boolean strings to booleans", () => {
    expect(coerceFormDataValue("true")).toBe(true)
    expect(coerceFormDataValue("false")).toBe(false)
  })

  it("should convert numeric strings to numbers", () => {
    expect(coerceFormDataValue("0")).toBe(0)
    expect(coerceFormDataValue("1")).toBe(1)
    expect(coerceFormDataValue("123")).toBe(123)
    expect(coerceFormDataValue("-42")).toBe(-42)
    expect(coerceFormDataValue("3.14")).toBe(3.14)
    expect(coerceFormDataValue("-0.5")).toBe(-0.5)
  })

  it("should preserve regular strings", () => {
    expect(coerceFormDataValue("hello")).toBe("hello")
    expect(coerceFormDataValue("test value")).toBe("test value")
    expect(coerceFormDataValue("NORMAL")).toBe("NORMAL")
    expect(coerceFormDataValue("en")).toBe("en")
  })

  it("should handle edge cases with numeric strings", () => {
    expect(coerceFormDataValue(" 123")).toBe(123)
    expect(coerceFormDataValue("123 ")).toBe(123)
    expect(coerceFormDataValue("0")).toBe(0)
    expect(coerceFormDataValue("00")).toBe(0)
    expect(coerceFormDataValue("000")).toBe(0)
    expect(coerceFormDataValue("0.0")).toBe(0)
    expect(coerceFormDataValue("-0")).toBe(-0)
  })

  it("should not convert strings that look like numbers but are not", () => {
    expect(coerceFormDataValue("")).toBe("")
    expect(coerceFormDataValue(" ")).toBe(" ")
    expect(coerceFormDataValue("abc123")).toBe("abc123")
    expect(coerceFormDataValue("123abc")).toBe("123abc")
  })

  it("should not handle special numeric values", () => {
    expect(coerceFormDataValue("Infinity")).toBe("Infinity")
    expect(coerceFormDataValue("-Infinity")).toBe("-Infinity")
    expect(coerceFormDataValue("NaN")).toBe("NaN")
  })

  it("should preserve strings that are not booleans or numbers", () => {
    expect(coerceFormDataValue("undefined")).toBe("undefined")
    expect(coerceFormDataValue("null")).toBe("null")
    expect(coerceFormDataValue("true ")).toBe("true ")
    expect(coerceFormDataValue(" false")).toBe(" false")
  })

  it("should handle very large numbers", () => {
    expect(coerceFormDataValue("9007199254740991")).toBe(9007199254740991)
    expect(coerceFormDataValue("1e10")).toBe(10000000000)
    expect(coerceFormDataValue("1e-10")).toBe(0.0000000001)
  })

  it("should handle edge cases", () => {
    expect(coerceFormDataValue("")).toBe("")
    expect(coerceFormDataValue("0")).toBe(0)
    expect(coerceFormDataValue("1")).toBe(1)
    expect(coerceFormDataValue("true")).toBe(true)
    expect(coerceFormDataValue("false")).toBe(false)
  })
})
