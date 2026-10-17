import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type AuditLogItem = {
  id: string
  action: string
  outcome: string
  actor: { id: string; user: { id: string } | null }
  target: { type: string; id: string } | null
}

describe("GET /audit-logs", () => {
  test("lists recorded actions newest first, with the actor's account", async ({
    app,
    services,
  }) => {
    const uploader = await signInAs(services, { role: "UPLOADER" })
    const admin = await signInAs(services, { role: "ADMIN" })
    const created = await api<{ id: string }>(app, "/groups", {
      method: "POST",
      headers: uploader.headers,
      json: { name: "Listed Scans" },
    })
    const res = await api<AuditLogItem[]>(app, "/audit-logs?action=group.CREATE", {
      headers: admin.headers,
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: [
        {
          action: "group.CREATE",
          outcome: "success",
          actor: { id: uploader.userId, user: { id: uploader.userId } },
          target: { type: "group", id: created.body.success ? created.body.data.id : "" },
        },
      ],
      meta: { page: 1, total: 1 },
    })
  })

  test("filters by actor, outcome and action prefix", async ({ app, services }) => {
    const user = await signInAs(services)
    const admin = await signInAs(services, { role: "ADMIN" })

    await api(app, "/groups", { method: "POST", headers: user.headers, json: { name: "x" } })
    await api(app, "/users/me/lists", {
      method: "POST",
      headers: user.headers,
      json: { name: "Mine" },
    })

    const denied = await api<AuditLogItem[]>(
      app,
      `/audit-logs?actorId=${user.userId}&outcome=denied`,
      { headers: admin.headers },
    )
    const lists = await api<AuditLogItem[]>(app, `/audit-logs?actionPrefix=list.`, {
      headers: admin.headers,
    })

    expect(denied.body.success && denied.body.data.map((log) => log.action)).toEqual([
      "group.CREATE",
    ])
    expect(lists.body.success && lists.body.data.map((log) => log.action)).toEqual(["list.CREATE"])
  })

  test("records that the audit log was read", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })

    await api(app, "/audit-logs", { headers: admin.headers })

    const [log] = await findAuditLogs(services, "audit.log.LIST")

    expect(log).toMatchObject({ outcome: "success", actorId: admin.userId })
  })

  test("denies, and records, non-admins", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/audit-logs", { headers: moderator.headers })

    expect(res.status).toBe(403)

    const [log] = await findAuditLogs(services, "audit.log.LIST")

    expect(log).toMatchObject({ outcome: "denied", actorId: moderator.userId })
  })
})

describe("GET /audit-logs/:id", () => {
  test("returns one entry with its changes", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })

    await api(app, "/users/me/settings", {
      method: "PATCH",
      headers: admin.headers,
      json: { latestUpdatesLayout: "GRID" },
    })

    const [log] = await findAuditLogs(services, "user.SETTINGS_UPDATE")
    const res = await api(app, `/audit-logs/${log?.id ?? ""}`, { headers: admin.headers })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      data: {
        action: "user.SETTINGS_UPDATE",
        target: { type: "user", id: admin.userId },
        changes: { after: { latestUpdatesLayout: "GRID" } },
        request: { method: "PATCH", path: "/users/me/settings", status: 200 },
      },
    })
  })

  test("returns AUDIT_LOG_NOT_FOUND for an unknown entry", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/audit-logs/${crypto.randomUUID()}`, { headers: admin.headers })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: "AUDIT_LOG_NOT_FOUND" })
  })
})

describe("auditLogs table", () => {
  test("rejects updates and deletes", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })

    await api(app, "/audit-logs", { headers: admin.headers })

    await expect(
      services.db.updateTable("auditLogs").set({ action: "tampered" }).execute(),
    ).rejects.toThrow(/append-only/)
    await expect(services.db.deleteFrom("auditLogs").execute()).rejects.toThrow(/append-only/)
  })
})
