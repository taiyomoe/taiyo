import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { seedAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Item = { action: string; target: { id: string } | null }

const containing = (text: string): unknown => expect.stringContaining(text)
const MEDIA_ID = "11111111-1111-4111-8111-111111111111"
const seed = async (services: Services) => {
  const admin = await signInAs(services, { role: "ADMIN" })
  const { username } = await services.db
    .selectFrom("users")
    .select("username")
    .where("id", "=", admin.userId)
    .executeTakeFirstOrThrow()

  await seedAuditLogs(services, [
    {
      action: "media.CREATE",
      actorId: admin.userId,
      target: { type: "media", id: MEDIA_ID, title: "Moonlit Garden" },
      at: "2026-10-10T10:15:00.000Z",
    },
    {
      action: "media.cover.CREATE",
      severity: "medium",
      actorId: admin.userId,
      target: { type: "media", id: MEDIA_ID, coverIds: ["c1"] },
      at: "2026-10-10T10:45:00.000Z",
    },
    {
      action: "media.DELETE",
      outcome: "denied",
      severity: "high",
      reason: "FORBIDDEN",
      status: 403,
      ip: "203.0.113.9",
      target: { type: "media", id: MEDIA_ID },
      at: "2026-10-10T12:05:00.000Z",
    },
    {
      action: "admin.ROLE_SET",
      severity: "critical",
      actorId: admin.userId,
      target: { type: "user", id: "u-2" },
      changes: { before: { role: "USER" }, after: { role: "MODERATOR" } },
      at: "2026-10-11T09:00:00.000Z",
    },
    {
      action: "auth.SIGN_IN",
      outcome: "failure",
      severity: "medium",
      reason: "INVALID_EMAIL_OR_PASSWORD",
      status: 401,
      ip: "198.51.100.4",
      at: "2026-10-11T23:30:00.000Z",
    },
  ])

  return { ...admin, username }
}
const search = async (
  app: Parameters<typeof api>[0],
  headers: Record<string, string>,
  q: string,
) => {
  const res = await api<Item[]>(
    app,
    `/audit-logs?${new URLSearchParams({ q, from: "2026-10-01T00:00:00.000Z", to: "2026-10-20T00:00:00.000Z" }).toString()}`,
    { headers },
  )

  return res.body.success ? res.body.data.map((item) => item.action) : res.body
}

describe("GET /audit-logs?q=", () => {
  test("filters with KQL", async ({ app, services }) => {
    const { headers, username } = await seed(services)

    expect(await search(app, headers, "outcome: denied")).toEqual(["media.DELETE"])
    expect(await search(app, headers, "outcome: (failure or denied)")).toEqual([
      "auth.SIGN_IN",
      "media.DELETE",
    ])
    expect(await search(app, headers, "category: media and not outcome: success")).toEqual([
      "media.DELETE",
    ])
    expect(await search(app, headers, "action: media.c*")).toEqual([
      "media.cover.CREATE",
      "media.CREATE",
    ])
    expect(await search(app, headers, `actor: ${username} and severity >= high`)).toEqual([
      "admin.ROLE_SET",
    ])
    expect(await search(app, headers, "target.coverIds: * or changed: role")).toEqual([
      "admin.ROLE_SET",
      "media.cover.CREATE",
    ])
    expect(await search(app, headers, "status >= 400 and reason: *password*")).toEqual([
      "auth.SIGN_IN",
    ])
    expect(await search(app, headers, "ip: 203.0.*")).toEqual(["media.DELETE"])
    expect(await search(app, headers, "moonlit")).toEqual(["media.CREATE"])
    expect(
      await search(app, headers, 'timestamp < "2026-10-10T11:00:00Z" and category: media'),
    ).toEqual(["media.cover.CREATE", "media.CREATE"])
  })

  test("sorts oldest first on request", async ({ app, services }) => {
    const { headers } = await seed(services)
    const res = await api<Item[]>(
      app,
      "/audit-logs?sort=asc&q=category:media&from=2026-10-01T00:00:00.000Z",
      { headers },
    )

    expect(res.body.success && res.body.data.map((item) => item.action)).toEqual([
      "media.CREATE",
      "media.cover.CREATE",
      "media.DELETE",
    ])
  })

  test("points at the part of the query that is wrong", async ({ app, services }) => {
    const { headers } = await seed(services)

    expect(await search(app, headers, "outcome: maybe")).toMatchObject({
      code: "VALIDATION_ERROR",
      details: [{ path: ["q"], start: 9, end: 14, message: containing("success") }],
    })
    expect(await search(app, headers, "colour: red")).toMatchObject({
      details: [{ message: 'Unknown field "colour".', start: 0, end: 6 }],
    })
  })
})

describe("GET /audit-logs/histogram", () => {
  test("counts each outcome per bucket, including empty buckets", async ({ app, services }) => {
    const { headers } = await seed(services)
    const res = await api<{
      total: number
      buckets: Array<{ start: string; success: number; failure: number; denied: number }>
    }>(
      app,
      "/audit-logs/histogram?q=category:media&interval=1h&from=2026-10-10T10:00:00.000Z&to=2026-10-10T13:00:00.000Z",
      { headers },
    )

    expect(res.body).toMatchObject({
      success: true,
      data: {
        total: 3,
        buckets: [
          { start: "2026-10-10T10:00:00.000Z", success: 2, failure: 0, denied: 0 },
          { start: "2026-10-10T11:00:00.000Z", success: 0, failure: 0, denied: 0 },
          { start: "2026-10-10T12:00:00.000Z", success: 0, failure: 0, denied: 1 },
        ],
      },
    })
  })

  test("buckets days in the requested time zone", async ({ app, services }) => {
    const { headers } = await seed(services)
    const res = await api<{ buckets: Array<{ start: string; failure: number }> }>(
      app,
      "/audit-logs/histogram?q=action:auth.SIGN_IN&interval=1d&tz=Europe/Paris&from=2026-10-11T00:00:00.000Z&to=2026-10-13T00:00:00.000Z",
      { headers },
    )
    const buckets = res.body.success ? res.body.data.buckets : []

    expect(buckets.find((bucket) => bucket.failure > 0)?.start).toBe("2026-10-11T22:00:00.000Z")
  })

  test("rejects a range that needs too many buckets", async ({ app, services }) => {
    const { headers } = await seed(services)
    const res = await api(
      app,
      "/audit-logs/histogram?interval=1m&from=2026-01-01T00:00:00.000Z&to=2026-10-01T00:00:00.000Z",
      { headers },
    )

    expect(res.status).toBe(422)
  })
})

describe("GET /audit-logs/facets", () => {
  test("returns the top values of each field", async ({ app, services }) => {
    const { headers, userId } = await seed(services)
    const res = await api(app, "/audit-logs/facets?from=2026-10-01T00:00:00.000Z", { headers })

    expect(res.body).toMatchObject({
      success: true,
      data: {
        total: 5,
        category: [
          { value: "media", count: 3 },
          { value: "admin", count: 1 },
          { value: "auth", count: 1 },
        ],
        actor: [
          { value: userId, count: 3, type: "user" },
          { value: "anonymous", count: 2 },
        ],
        outcome: [
          { value: "success", count: 3 },
          { value: "denied", count: 1 },
          { value: "failure", count: 1 },
        ],
      },
    })
  })
})

describe("GET /audit-logs/suggestions", () => {
  test("suggests actions, users and recently seen values", async ({ app, services }) => {
    const { headers, username } = await seed(services)
    const actions = await api<Array<{ value: string }>>(
      app,
      "/audit-logs/suggestions?field=action&query=role",
      { headers },
    )
    const actors = await api<Array<{ value: string }>>(
      app,
      `/audit-logs/suggestions?field=actor&query=${username.slice(0, 4)}`,
      { headers },
    )

    expect(actions.body.success && actions.body.data.map(({ value }) => value)).toEqual([
      "admin.ROLE_SET",
    ])
    expect(actors.body.success && actors.body.data.map(({ value }) => value)).toContain(username)
  })

  test("rejects unknown fields", async ({ app, services }) => {
    const { headers } = await seed(services)
    const res = await api(app, "/audit-logs/suggestions?field=colour", { headers })

    expect(res.status).toBe(422)
  })
})

describe("GET /audit-logs/groups", () => {
  test("groups runs of the same action by the same actor", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const reader = await signInAs(services)

    await seedAuditLogs(services, [
      {
        action: "history.PROGRESS_UPDATE",
        actorId: reader.userId,
        target: { type: "chapter", id: "c1" },
        at: "2026-10-10T10:00:00.000Z",
      },
      { action: "auth.SIGN_IN", actorId: admin.userId, at: "2026-10-10T10:05:00.000Z" },
      {
        action: "history.PROGRESS_UPDATE",
        actorId: reader.userId,
        target: { type: "chapter", id: "c2" },
        at: "2026-10-10T10:20:00.000Z",
      },
      {
        action: "history.PROGRESS_UPDATE",
        actorId: reader.userId,
        target: { type: "chapter", id: "c2" },
        at: "2026-10-10T10:40:00.000Z",
      },
      {
        action: "history.PROGRESS_UPDATE",
        actorId: reader.userId,
        target: { type: "chapter", id: "c3" },
        at: "2026-10-10T12:00:00.000Z",
      },
      {
        action: "auth.SIGN_IN",
        outcome: "denied",
        ip: "203.0.113.1",
        at: "2026-10-10T13:00:00.000Z",
      },
      {
        action: "auth.SIGN_IN",
        outcome: "denied",
        ip: "203.0.113.1",
        at: "2026-10-10T13:01:00.000Z",
      },
      {
        action: "auth.SIGN_IN",
        outcome: "denied",
        ip: "198.51.100.2",
        at: "2026-10-10T13:02:00.000Z",
      },
    ])

    const res = await api<
      Array<{
        count: number
        first: string
        last: string
        targets: number
        entry: { action: string }
      }>
    >(app, "/audit-logs/groups?from=2026-10-10T00:00:00.000Z&to=2026-10-11T00:00:00.000Z", {
      headers: admin.headers,
    })

    expect(res.body).toMatchObject({
      success: true,
      data: [
        { count: 1, entry: { action: "auth.SIGN_IN" }, last: "2026-10-10T13:02:00.000Z" },
        {
          count: 2,
          targets: 0,
          first: "2026-10-10T13:00:00.000Z",
          last: "2026-10-10T13:01:00.000Z",
        },
        { count: 1, last: "2026-10-10T12:00:00.000Z" },
        {
          count: 3,
          targets: 2,
          first: "2026-10-10T10:00:00.000Z",
          last: "2026-10-10T10:40:00.000Z",
          entry: { action: "history.PROGRESS_UPDATE" },
        },
        { count: 1, entry: { action: "auth.SIGN_IN" }, last: "2026-10-10T10:05:00.000Z" },
      ],
      meta: { total: 5, entries: 8 },
    })
  })
})
