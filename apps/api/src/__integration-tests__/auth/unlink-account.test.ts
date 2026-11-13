import type { Hono } from "hono"
import { randomInt, randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { test } from "../setup"

const ORIGIN = "http://localhost"
const auth = async (app: Hono, path: string, cookie: string, json: unknown) => {
  const res = await app.request(`/api/auth${path}`, {
    method: "POST",
    headers: {
      cookie,
      origin: ORIGIN,
      "content-type": "application/json",
      "x-forwarded-for": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
    },
    body: JSON.stringify(json),
  })
  const body: unknown = await res.json()

  return { status: res.status, body, setCookies: res.headers.getSetCookie() }
}

describe("POST /api/auth/unlink-account", () => {
  test("keeps the password account and unlinks the others", async ({ app, services }) => {
    const { db } = services
    const signedIn = await auth(app, "/sign-in/email", "", {
      email: "user@gmail.com",
      password: "password123",
    })
    const cookie = signedIn.setCookies
      .map((value) => value.split(";")[0] ?? "")
      .filter((value) => !value.endsWith("="))
      .join("; ")
    const { id: userId } = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", "user@gmail.com")
      .executeTakeFirstOrThrow()
    const discordId = randomUUID()

    await db
      .insertInto("accounts")
      .values({ id: discordId, userId, providerId: "discord", accountId: "discord-1" })
      .execute()

    const credential = await db
      .selectFrom("accounts")
      .select("id")
      .where("userId", "=", userId)
      .where("providerId", "=", "credential")
      .executeTakeFirstOrThrow()

    expect(await auth(app, "/unlink-account", cookie, { accountId: credential.id })).toMatchObject({
      status: 400,
      body: { code: "CANNOT_UNLINK_PASSWORD" },
    })
    expect((await auth(app, "/unlink-account", cookie, { accountId: discordId })).status).toBe(200)

    const remaining = await db
      .selectFrom("accounts")
      .select("providerId")
      .where("userId", "=", userId)
      .execute()

    expect(remaining.map((account) => account.providerId)).toEqual(["credential"])
  })
})
