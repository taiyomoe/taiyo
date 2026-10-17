import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"

describe("Audited routes", () => {
  test("records who created what", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "UPLOADER" })
    const res = await api<{ id: string }>(app, "/groups", {
      method: "POST",
      headers,
      json: { name: "Audited Scans" },
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)

    const [log] = await findAuditLogs(services, "group.CREATE")

    expect(log).toMatchObject({
      outcome: "success",
      severity: "medium",
      actorType: "user",
      actorId: userId,
      targetType: "group",
      targetId: res.body.success ? res.body.data.id : undefined,
      reason: null,
    })
    expect(log?.event).toMatchObject({
      audit: { target: { name: "Audited Scans" } },
      method: "POST",
      path: "/groups",
    })
  })

  test("records the changed fields of an update", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { description } = await services.db
      .selectFrom("groups")
      .select("description")
      .where("id", "=", SEEDED_GROUP_ID)
      .executeTakeFirstOrThrow()

    await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: { name: "Renamed", description },
    })

    const [log] = await findAuditLogs(services, "group.UPDATE")

    expect(log?.targetId).toBe(SEEDED_GROUP_ID)
    expect(log?.event).toMatchObject({
      audit: {
        changes: {
          after: { name: "Renamed" },
          patch: [{ op: "replace", path: "/name", value: "Renamed" }],
        },
      },
    })
  })

  test("records a denied action with the actor", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, "/groups", { method: "POST", headers, json: { name: "Nope" } })

    expect(res.status).toBe(403)

    const [log] = await findAuditLogs(services, "group.CREATE")

    expect(log).toMatchObject({ outcome: "denied", actorId: userId, reason: "FORBIDDEN" })
  })

  test("records a failed action with its error code", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: {},
    })

    expect(res.status).toBe(422)

    const [log] = await findAuditLogs(services, "group.UPDATE")

    expect(log).toMatchObject({
      outcome: "failure",
      reason: "VALIDATION_ERROR",
      targetId: SEEDED_GROUP_ID,
    })
    expect(log?.event).not.toHaveProperty("audit.changes")
  })

  test("records signed-out attempts as anonymous", async ({ app, services }) => {
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "DELETE",
      headers: { "x-forwarded-for": "203.0.113.7", "user-agent": "audit-test" },
    })

    expect(res.status).toBe(401)

    const [log] = await findAuditLogs(services, "group.DELETE")

    expect(log).toMatchObject({
      outcome: "denied",
      actorType: "user",
      actorId: "anonymous",
      reason: "UNAUTHORIZED",
      ip: "203.0.113.7",
      userAgent: "audit-test",
    })
  })

  test("attributes an impersonated action to the impersonating admin", async ({
    app,
    services,
  }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const { userId, headers } = await signInAs(services)

    await services.db
      .updateTable("sessions")
      .set({ impersonatedBy: admin.userId })
      .where("userId", "=", userId)
      .execute()
    await api(app, "/users/me/lists", { method: "POST", headers, json: { name: "Theirs" } })

    const [log] = await findAuditLogs(services, "list.CREATE")

    expect(log).toMatchObject({ actorId: admin.userId })
    expect(log?.event).toMatchObject({ audit: { actor: { impersonating: userId } } })
  })

  test("links the entry to the request id of the response", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await app.request(`/users/${crypto.randomUUID()}/follow`, {
      method: "POST",
      headers,
    })
    const body: unknown = await res.json()
    const [log] = await findAuditLogs(services, "user.FOLLOW")

    expect(body).toMatchObject({ requestId: log?.requestId })
  })
})
