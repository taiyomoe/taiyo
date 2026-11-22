import { describe, expect, it } from "vitest"
import { isInternalPath, toInternalPath } from "../internal-path"

describe("isInternalPath", () => {
  it.each([
    "/",
    "/media/abc",
    "/notifications?category=moderation",
    "/media/x?tab=comments#c1",
    "/users/%2F%2Fname",
  ])("accepts %j", (value) => {
    expect(isInternalPath(value)).toBe(true)
  })

  it.each([
    undefined,
    "",
    "media/abc",
    "https://example.com/",
    "//example.com",
    "/\\example.com",
    "/\t/example.com",
    "/\n/example.com",
    "/\r/example.com",
    "\t//example.com",
    // oxlint-disable-next-line no-script-url -- a refused value, not code that runs
    "javascript:void(0)",
    123,
  ])("refuses %j", (value) => {
    expect(isInternalPath(value)).toBe(false)
  })
})

describe("toInternalPath", () => {
  it("falls back to the root for a path that leaves the site", () => {
    expect(toInternalPath("//example.com")).toBe("/")
  })

  it("uses the given fallback when there is no value", () => {
    expect(toInternalPath(undefined, "/notifications")).toBe("/notifications")
  })

  it("keeps an internal path", () => {
    expect(toInternalPath("/library")).toBe("/library")
  })
})
