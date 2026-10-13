import {
  captchaEndpoints,
  createBeforeUserCreatedHook,
  rateLimitRules,
} from "@taiyomoe/auth/server"
import { normalizeDisplayName, normalizeUsername } from "@taiyomoe/utils"
import { randomInt, randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

const buildUser = (name: string) => ({
  id: randomUUID(),
  name,
  email: `${randomUUID()}@test.local`,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe("Sign-up", () => {
  test("every captcha and rate-limit path is a real route", ({ services }) => {
    const paths = new Set(Object.values(services.auth.api).map((endpoint) => endpoint.path))

    for (const path of [...captchaEndpoints, ...Object.keys(rateLimitRules)]) {
      expect(paths).toContain(path)
    }
  })

  test("suffixes a derived username that is already taken", async ({ services }) => {
    const { userId } = await signInAs(services)
    const { username: existing } = await services.db
      .selectFrom("users")
      .select("username")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()
    const hook = createBeforeUserCreatedHook({ db: services.db })
    const { data } = await hook(buildUser(existing))
    const suffixed = new RegExp(`^${existing}_\\d{4}$`)

    expect(data.username).not.toBe(existing)
    expect(data.username).toMatch(suffixed)
    expect(data.displayUsername).toMatch(suffixed)
    expect(data.name).toBe(existing)
  })

  test("keeps the derived username when nothing collides", async ({ services }) => {
    const name = `Fresh ${randomUUID().slice(0, 8)}`
    const hook = createBeforeUserCreatedHook({ db: services.db })
    const { data } = await hook(buildUser(name))

    expect(data.username).toBe(normalizeUsername(name))
    expect(data.displayUsername).toBe(normalizeDisplayName(name))
  })

  test("keeps a suffixed username within the max length", async ({ services }) => {
    const handle = "a".repeat(30)
    const email = `${randomUUID()}@test.local`

    await services.db
      .insertInto("users")
      .values({
        id: randomUUID(),
        name: handle,
        email,
        normalizedEmail: email,
        emailVerified: true,
        username: handle,
        displayUsername: handle,
        role: "USER",
        banned: false,
      })
      .execute()

    const hook = createBeforeUserCreatedHook({ db: services.db })
    const { data } = await hook(buildUser(handle))

    expect(data.username.length).toBeLessThanOrEqual(30)
    expect(data.displayUsername.length).toBeLessThanOrEqual(30)
    expect(data.username).toMatch(/_\d{4}$/)
    expect(data.displayUsername).toMatch(/_\d{4}$/)
  })

  test("rejects a sign-up without a captcha token", async ({ app }) => {
    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
      },
      body: JSON.stringify({
        name: "Captcha Less",
        email: `${randomUUID()}@test.local`,
        password: randomUUID().slice(0, 12),
      }),
    })
    const body: unknown = await res.json()

    expect(res.status).toBe(400)
    expect(body).toMatchObject({ code: "MISSING_RESPONSE" })
  })
})
