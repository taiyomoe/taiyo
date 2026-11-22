import { describe, expect, it } from "vitest"
import { toSafeHref } from "../safe-href"

describe("toSafeHref", () => {
  it("keeps an http(s) URL", () => {
    expect(toSafeHref("https://example.com/a")).toBe("https://example.com/a")
  })

  it("refuses other schemes", () => {
    expect(toSafeHref("ftp://example.com")).toBeNull()
  })

  it("refuses text that is not a URL", () => {
    expect(toSafeHref("not a url")).toBeNull()
  })

  it("refuses a URL with credentials", () => {
    expect(toSafeHref("https://user:pass@example.com")).toBeNull()
  })
})
