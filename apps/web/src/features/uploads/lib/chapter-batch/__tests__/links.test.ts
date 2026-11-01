import { describe, expect, it } from "vitest"
import { hostOf, isWebUrl, resolveLink } from "../links"

describe("resolveLink", () => {
  it("prefers the chapter's own link", () => {
    expect(resolveLink(" https://a.example/12 ", "https://b.example/{number}", "12")).toBe(
      "https://a.example/12",
    )
  })

  it("fills the template with the chapter number", () => {
    expect(resolveLink("", "https://b.example/{number}/read#{number}", "12.5")).toBe(
      "https://b.example/12.5/read#12.5",
    )
  })

  it("gives no link without either", () => {
    expect(resolveLink(" ", "", "1")).toBeNull()
  })
})

describe("isWebUrl", () => {
  it.each([
    ["https://scans.example/1", true],
    ["http://scans.example", true],
    ["data:text/html,<p>hi</p>", false],
    ["ftp://scans.example", false],
    ["scans.example/1", false],
    [`https://scans.example/${"a".repeat(600)}`, false],
  ])("%s → %s", (value, expected) => {
    expect(isWebUrl(value)).toBe(expected)
  })
})

describe("hostOf", () => {
  it("shows the host of a link", () => {
    expect(hostOf("https://www.scans.example:8080/a")).toBe("www.scans.example:8080")
  })
})
