import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const anyString: unknown = expect.any(String)

type DataExport = {
  id: string
  status: "PENDING" | "READY" | "FAILED" | "EXPIRED"
  requestedAt: string
  finishedAt: string | null
  expiresAt: string | null
  byteSize: number | null
}
type DataExportState = { latest: DataExport | null; nextRequestAt: string | null }

const DAY_MS = 24 * 60 * 60 * 1000
const request = (app: Parameters<typeof api>[0], headers: Record<string, string>) =>
  api<DataExport>(app, "/users/me/data-exports", { method: "POST", headers })
const getLatest = async (app: Parameters<typeof api>[0], headers: Record<string, string>) => {
  const res = await api<DataExportState>(app, "/users/me/data-exports/latest", { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const ageSession = ({ db }: Services, userId: string) =>
  db
    .updateTable("sessions")
    .set({ createdAt: new Date(Date.now() - 2 * DAY_MS) })
    .where("userId", "=", userId)
    .execute()
const seedExport = async (
  { db }: Services,
  userId: string,
  values: { status: DataExport["status"]; createdAt?: Date; expiresAt?: Date | null },
) => {
  const row = await db
    .insertInto("dataExports")
    .values({
      userId,
      status: values.status,
      createdAt: values.createdAt ?? new Date(),
      finishedAt: values.status === "PENDING" ? null : new Date(),
      expiresAt: values.expiresAt ?? null,
      byteSize: values.status === "PENDING" ? null : "1024",
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  return row.id
}

describe("POST /users/me/data-exports", () => {
  test("requires a signed-in user", async ({ app }) => {
    const res = await api(app, "/users/me/data-exports", { method: "POST" })

    expect(res.status).toBe(401)
  })

  test("queues an export and records the request", async ({ app, services, dataExportJobs }) => {
    const { userId, headers } = await signInAs(services)
    const res = await request(app, headers)

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toMatchObject({
      status: "PENDING",
      finishedAt: null,
      expiresAt: null,
      byteSize: null,
    })
    expect(dataExportJobs).toEqual([{ exportId: res.body.data.id, settingsUrl: anyString }])
    expect(dataExportJobs[0]?.settingsUrl).toMatch(/\/settings\?tab=privacy$/)

    const [log] = await findAuditLogs(services, "user.export.REQUEST")

    expect(log).toMatchObject({ actorId: userId, outcome: "success", targetId: res.body.data.id })
  })

  test("allows one export a day", async ({ app, services, dataExportJobs }) => {
    const { headers } = await signInAs(services)

    expect((await request(app, headers)).status).toBe(201)

    const second = await request(app, headers)

    expect(second.status).toBe(409)
    expect(second.body).toMatchObject({
      success: false,
      code: "DATA_EXPORT_COOLDOWN",
      details: { retryAt: anyString },
    })
    expect(dataExportJobs).toHaveLength(1)

    const state = await getLatest(app, headers)

    expect(state.nextRequestAt).not.toBeNull()
    expect(new Date(state.nextRequestAt ?? 0).getTime()).toBeGreaterThan(
      Date.now() + DAY_MS - 60_000,
    )
  })

  test("takes one of two requests sent at once", async ({ app, services, dataExportJobs }) => {
    const { userId, headers } = await signInAs(services)
    const results = await Promise.all([request(app, headers), request(app, headers)])

    expect(results.map(({ status }) => status).sort((a, b) => a - b)).toEqual([201, 409])
    expect(dataExportJobs).toHaveLength(1)

    const rows = await services.db
      .selectFrom("dataExports")
      .select("id")
      .where("userId", "=", userId)
      .execute()

    expect(rows).toHaveLength(1)
  })

  test("lets the user ask again after a failure", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)

    await seedExport(services, userId, { status: "FAILED" })

    expect((await request(app, headers)).status).toBe(201)
  })

  test("lets the user ask again a day later", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)

    await seedExport(services, userId, {
      status: "READY",
      createdAt: new Date(Date.now() - DAY_MS - 60_000),
      expiresAt: new Date(Date.now() + DAY_MS),
    })

    expect((await request(app, headers)).status).toBe(201)
  })

  test("needs a recent sign-in", async ({ app, services, dataExportJobs }) => {
    const { userId, headers } = await signInAs(services)

    await ageSession(services, userId)

    const res = await request(app, headers)

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ success: false, code: "SESSION_NOT_FRESH" })
    expect(dataExportJobs).toHaveLength(0)
  })

  test("refuses a banned user", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })

    expect((await request(app, headers)).status).toBe(403)
  })
})

describe("GET /users/me/data-exports/latest", () => {
  test("is empty for a user who never asked", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    expect(await getLatest(app, headers)).toEqual({ latest: null, nextRequestAt: null })
  })

  test("shows only the user's own exports", async ({ app, services }) => {
    const owner = await signInAs(services)
    const other = await signInAs(services)

    await seedExport(services, owner.userId, { status: "PENDING" })

    expect(await getLatest(app, other.headers)).toEqual({ latest: null, nextRequestAt: null })
  })

  test("reads a ready archive past its expiry as expired", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)

    await seedExport(services, userId, {
      status: "READY",
      createdAt: new Date(Date.now() - 8 * DAY_MS),
      expiresAt: new Date(Date.now() - 60_000),
    })

    const state = await getLatest(app, headers)

    expect(state.latest?.status).toBe("EXPIRED")
    expect(state.nextRequestAt).toBeNull()
  })
})

describe("POST /users/me/data-exports/:id/download", () => {
  const download = (app: Parameters<typeof api>[0], headers: Record<string, string>, id: string) =>
    api<{ url: string; expiresAt: string }>(app, `/users/me/data-exports/${id}/download`, {
      method: "POST",
      headers,
    })

  test("returns a short-lived link to a ready archive and records it", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services)
    const id = await seedExport(services, userId, {
      status: "READY",
      expiresAt: new Date(Date.now() + DAY_MS),
    })
    const res = await download(app, headers, id)

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const url = new URL(res.body.data.url)

    expect(url.pathname).toContain(`data-exports/${userId}/${id}.zip`)
    expect(url.searchParams.get("X-Amz-Expires")).toBe("60")
    expect(url.searchParams.get("response-content-disposition")).toMatch(
      /^attachment; filename="taiyo-data-\d{4}-\d{2}-\d{2}\.zip"$/,
    )

    const [log] = await findAuditLogs(services, "user.export.DOWNLOAD")

    expect(log).toMatchObject({ actorId: userId, outcome: "success", targetId: id })
  })

  test("refuses an archive that is not ready", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const pending = await seedExport(services, userId, { status: "PENDING" })
    const expired = await seedExport(services, userId, {
      status: "READY",
      expiresAt: new Date(Date.now() - 1000),
    })

    for (const id of [pending, expired]) {
      expect((await download(app, headers, id)).body).toMatchObject({
        success: false,
        code: "DATA_EXPORT_NOT_READY",
      })
    }
  })

  test("hides another user's export", async ({ app, services }) => {
    const owner = await signInAs(services)
    const other = await signInAs(services)
    const id = await seedExport(services, owner.userId, {
      status: "READY",
      expiresAt: new Date(Date.now() + DAY_MS),
    })
    const res = await download(app, other.headers, id)

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ success: false, code: "DATA_EXPORT_NOT_FOUND" })
  })

  test("needs a recent sign-in", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const id = await seedExport(services, userId, {
      status: "READY",
      expiresAt: new Date(Date.now() + DAY_MS),
    })

    await ageSession(services, userId)

    expect((await download(app, headers, id)).body).toMatchObject({
      success: false,
      code: "SESSION_NOT_FRESH",
    })
  })
})
