import { describe, expect, it } from "vitest"
import { isPushServiceEndpoint } from "../push-service"

describe("isPushServiceEndpoint", () => {
  it("accepts a Chrome push endpoint", () => {
    expect(isPushServiceEndpoint("https://fcm.googleapis.com/fcm/send/abc")).toBe(true)
  })

  it("accepts a numbered Edge push subdomain", () => {
    expect(isPushServiceEndpoint("https://wns2-par02p.notify.windows.com/w/?token=x")).toBe(true)
  })

  it("accepts a Safari push endpoint", () => {
    expect(isPushServiceEndpoint("https://web.push.apple.com/abc")).toBe(true)
  })

  it("refuses an endpoint that is not https", () => {
    expect(isPushServiceEndpoint("http://fcm.googleapis.com/x")).toBe(false)
  })

  it("refuses a host that only starts with a push service host", () => {
    expect(isPushServiceEndpoint("https://fcm.googleapis.com.example.org/x")).toBe(false)
  })

  it("refuses the bare domain of a push service subdomain list", () => {
    expect(isPushServiceEndpoint("https://notify.windows.com/x")).toBe(false)
  })

  it("refuses something that is not a url", () => {
    expect(isPushServiceEndpoint("not a url")).toBe(false)
  })
})
