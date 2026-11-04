import { createAuth } from "@taiyomoe/auth/server"
import { randomInt, randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { createApp } from "../../app"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

const SEEDED_USER_ID = "a850ab0e-de0a-4cb8-8592-9c9e1fb89bd5"
const WEB_ORIGIN = "http://web.taiyo.test"
const createWebApp = (services: Services) =>
  createApp({ ...services, auth: createAuth({ db: services.db, trustedOrigins: [WEB_ORIGIN] }) })
const authHeaders = (headers: Record<string, string> = {}) => ({
  "content-type": "application/json",
  origin: WEB_ORIGIN,
  "x-forwarded-for": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
  ...headers,
})

describe("Audited auth requests", () => {
  test("records who signed in", async ({ services }) => {
    const app = createWebApp(services)
    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email: "user@gmail.com", password: "password123" }),
    })

    expect(res.status).toBe(200)

    const [log] = await findAuditLogs(services, "auth.SIGN_IN")

    expect(log).toMatchObject({
      outcome: "success",
      actorId: SEEDED_USER_ID,
      targetType: "user",
      targetId: SEEDED_USER_ID,
    })
    expect(log?.event).toMatchObject({ audit: { target: { method: "email" } } })
  })

  test("records a failed sign-in against the targeted account", async ({ services }) => {
    const app = createWebApp(services)
    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email: "user@gmail.com", password: "wrong-password" }),
    })

    expect(res.status).toBeGreaterThanOrEqual(400)

    const [log] = await findAuditLogs(services, "auth.SIGN_IN")

    expect(log).toMatchObject({
      outcome: "denied",
      actorId: "anonymous",
      targetId: SEEDED_USER_ID,
      reason: "INVALID_EMAIL_OR_PASSWORD",
    })
  })

  test("records who signed out", async ({ services }) => {
    const app = createWebApp(services)
    const { userId, headers } = await signInAs(services)
    const res = await app.request("/api/auth/sign-out", {
      method: "POST",
      headers: authHeaders(headers),
      body: "{}",
    })

    expect(res.status).toBe(200)

    const [log] = await findAuditLogs(services, "auth.SIGN_OUT")

    expect(log).toMatchObject({ outcome: "success", actorId: userId, targetId: userId })
  })

  test("records a profile edit with its changes", async ({ services }) => {
    const app = createWebApp(services)
    const { userId, headers } = await signInAs(services)
    const res = await app.request("/api/auth/update-user", {
      method: "POST",
      headers: authHeaders(headers),
      body: JSON.stringify({ name: "Renamed User" }),
    })

    expect(res.status).toBe(200)

    const [log] = await findAuditLogs(services, "user.PROFILE_UPDATE")

    expect(log).toMatchObject({ outcome: "success", actorId: userId, targetId: userId })
    expect(log?.event).toMatchObject({
      audit: { changes: { after: { name: "Renamed User" } } },
    })
  })

  test("records a rejected sign-up", async ({ services }) => {
    const app = createWebApp(services)
    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: "Captcha Less",
        email: `${randomUUID()}@test.local`,
        password: randomUUID().slice(0, 12),
      }),
    })

    expect(res.status).toBe(400)

    const [log] = await findAuditLogs(services, "auth.SIGN_UP")

    expect(log).toMatchObject({
      outcome: "failure",
      actorId: "anonymous",
      targetId: null,
      reason: "MISSING_RESPONSE",
    })
  })

  test("does not record session reads", async ({ services }) => {
    const app = createWebApp(services)
    const { headers } = await signInAs(services)

    await app.request("/api/auth/get-session", { headers: authHeaders(headers) })

    const logs = await services.db.selectFrom("auditLogs").select("action").execute()

    expect(logs).toEqual([])
  })
})
