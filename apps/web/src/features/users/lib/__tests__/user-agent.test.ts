import { describe, expect, it } from "vitest"
import { describeUserAgent } from "../user-agent"

describe("describeUserAgent", () => {
  it.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      { browser: "Chrome", os: "Windows" },
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      { browser: "Edge", os: "Windows" },
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      { browser: "Safari", os: "iOS" },
    ],
    [
      "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
      { browser: "Firefox", os: "Linux" },
    ],
    [
      "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
      { browser: "Chrome", os: "Android" },
    ],
  ])("reads %s", (value, expected) => {
    expect(describeUserAgent(value)).toEqual(expected)
  })

  it.each([null, "", "curl/8.5.0"])("gives nothing for %o", (value) => {
    expect(describeUserAgent(value)).toBeNull()
  })
})
