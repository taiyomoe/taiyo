import { createAuth } from "@taiyomoe/auth/server"
import { describe, expect } from "vitest"
import { test } from "../setup"

const WEB_ORIGIN = "http://web.taiyo.test"
const signIn = (auth: ReturnType<typeof createAuth>, origin: string) =>
  auth.handler(
    new Request("http://localhost/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "theme=dark",
        origin,
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250)}`,
      },
      body: JSON.stringify({ email: "nobody@taiyo.test", password: "wrong-password" }),
    }),
  )

describe("Better Auth trusted origins", () => {
  test("accepts a cookie-bearing request from a trusted origin", async ({ services }) => {
    const auth = createAuth({ db: services.db, trustedOrigins: [WEB_ORIGIN] })
    const res = await signIn(auth, WEB_ORIGIN)

    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({ code: "INVALID_EMAIL_OR_PASSWORD" })
  })

  test("rejects a cookie-bearing request from any other origin", async ({ services }) => {
    const auth = createAuth({ db: services.db, trustedOrigins: [WEB_ORIGIN] })
    const res = await signIn(auth, "http://evil.taiyo.test")

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ code: "INVALID_ORIGIN" })
  })
})
