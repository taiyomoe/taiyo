import type * as Email from "@taiyomoe/email"
import type { Hono } from "hono"
import { randomInt, randomUUID } from "node:crypto"
import { describe, expect, vi } from "vitest"
import { test } from "../setup"

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn<typeof Email.sendEmail>() }))

vi.mock("@taiyomoe/email", async (importOriginal) => ({
  ...(await importOriginal<typeof Email>()),
  sendEmail,
}))

const PASSWORD = "password123"
const signIn = async (app: Hono, email: string) => {
  const res = await app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      "content-type": "application/json",
      "cf-connecting-ip": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
    },
    body: JSON.stringify({ email, password: PASSWORD }),
  })
  const body: unknown = await res.json()

  return { status: res.status, body }
}

describe("Email sign-in of an unverified account", () => {
  test("sends a new verification link, then refuses to resend it within the hour", async ({
    app,
    services,
  }) => {
    const { db, auth } = services
    const userId = randomUUID()
    const handle = `u${userId.replace(/-/g, "").slice(0, 12)}`
    const email = `${handle}@test.local`
    const { password } = await auth.$context

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

    expect(await signIn(app, email)).toMatchObject({
      status: 403,
      body: { code: "EMAIL_NOT_VERIFIED" },
    })
    await vi.waitFor(() => {
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: email, subject: "Verify your email" }),
      )
    })

    expect(await signIn(app, email)).toMatchObject({
      status: 403,
      body: { code: "VERIFICATION_EMAIL_ALREADY_SENT" },
    })
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })
})
