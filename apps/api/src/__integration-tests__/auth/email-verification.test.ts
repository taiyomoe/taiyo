import { type AuthEmail, createAuth } from "@taiyomoe/auth/server"
import { randomInt, randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { test } from "../setup"

const ORIGIN = "http://localhost"
const PASSWORD = "password123"

describe("Email sign-in of an unverified account", () => {
  test("sends a new verification link, then refuses to resend it within the hour", async ({
    services,
  }) => {
    const { db } = services
    const sent: Array<Pick<AuthEmail, "kind" | "to">> = []
    const auth = createAuth({
      db,
      trustedOrigins: [ORIGIN],
      sendEmail: ({ kind, to }) => {
        sent.push({ kind, to })

        return Promise.resolve()
      },
    })
    const userId = randomUUID()
    const handle = `u${userId.replace(/-/g, "").slice(0, 12)}`
    const email = `${handle}@test.local`
    const { password } = await auth.$context
    const signIn = async () => {
      const res = await auth.handler(
        new Request(`${ORIGIN}/api/auth/sign-in/email`, {
          method: "POST",
          headers: {
            origin: ORIGIN,
            "content-type": "application/json",
            "cf-connecting-ip": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
          },
          body: JSON.stringify({ email, password: PASSWORD }),
        }),
      )
      const body: unknown = await res.json()

      return { status: res.status, body }
    }

    await db
      .insertInto("users")
      .values({
        id: userId,
        name: handle,
        email,
        normalizedEmail: email,
        emailVerified: false,
        username: handle,
        displayUsername: handle,
        role: "USER",
        banned: false,
      })
      .execute()
    await db
      .insertInto("accounts")
      .values({
        userId,
        providerId: "credential",
        accountId: userId,
        password: await password.hash(PASSWORD),
      })
      .execute()

    expect(await signIn()).toMatchObject({ status: 403, body: { code: "EMAIL_NOT_VERIFIED" } })
    expect(sent).toEqual([{ kind: "verify-email", to: email }])

    expect(await signIn()).toMatchObject({
      status: 403,
      body: { code: "VERIFICATION_EMAIL_ALREADY_SENT" },
    })
    expect(sent).toHaveLength(1)
  })
})
