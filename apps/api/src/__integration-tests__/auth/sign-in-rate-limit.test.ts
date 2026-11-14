import { rateLimitRules } from "@taiyomoe/auth/server"
import { randomInt } from "node:crypto"
import { describe, expect } from "vitest"
import { test } from "../setup"

const randomIp = () => `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`

describe("Better Auth sign-in rate limit", () => {
  test("counts attempts by the address Cloudflare saw, whatever X-Forwarded-For says", async ({
    app,
  }) => {
    const clientIp = randomIp()
    const attempt = () =>
      app.request("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          origin: "http://localhost",
          "content-type": "application/json",
          "cf-connecting-ip": clientIp,
          "x-forwarded-for": randomIp(),
        },
        body: JSON.stringify({ email: "nobody-5d1e@gmail.com", password: "wrong-password-1" }),
      })
    const { max } = rateLimitRules["/sign-in/email"]
    const statuses: number[] = []

    for (let i = 0; i <= max; i++) {
      statuses.push((await attempt()).status)
    }

    expect(statuses.at(-1)).toBe(429)
  })
})
