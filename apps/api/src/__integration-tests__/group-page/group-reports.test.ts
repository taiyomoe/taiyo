import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { test } from "../setup"

describe("group reports", () => {
  test("files one pending report per user and lets moderators review it", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const groupId = await seedGroup(services, userId, `report-${userId}`)
    const created = await api<{ id: string; status: string }>(app, `/groups/${groupId}/reports`, {
      method: "POST",
      headers,
      json: { reason: "IMPERSONATION", details: "  They copied another group's name.  " },
    })

    expect(created.status).toBe(201)

    if (!created.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(created.body)}`)
    }

    const reportId = created.body.data.id

    expect(created.body.data.status).toBe("PENDING")

    const duplicate = await api(app, `/groups/${groupId}/reports`, {
      method: "POST",
      headers,
      json: { reason: "SPAM" },
    })

    expect(duplicate.body).toMatchObject({ success: false, code: "GROUP_REPORT_EXISTS" })

    const forbidden = await api(app, "/group-reports", { headers })

    expect(forbidden.status).toBe(403)

    const list = await api<Array<{ id: string; details: string | null }>>(
      app,
      "/group-reports?perPage=100",
      { headers: moderator.headers },
    )

    if (!list.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(list.body)}`)
    }

    expect(list.body.data.find((report) => report.id === reportId)).toMatchObject({
      details: "They copied another group's name.",
    })

    const reviewed = await api(app, `/group-reports/${reportId}/review`, {
      method: "POST",
      headers: moderator.headers,
      json: { status: "DISMISSED" },
    })

    expect(reviewed.status).toBe(201)

    const again = await api(app, `/group-reports/${reportId}/review`, {
      method: "POST",
      headers: moderator.headers,
      json: { status: "RESOLVED" },
    })

    expect(again.body).toMatchObject({ success: false, code: "GROUP_REPORT_NOT_PENDING" })

    const refiled = await api(app, `/groups/${groupId}/reports`, {
      method: "POST",
      headers,
      json: { reason: "OTHER" },
    })

    expect(refiled.status).toBe(201)

    const creations = await findAuditLogs(services, "group.report.CREATE")
    const reviews = await findAuditLogs(services, "group.report.REVIEW")

    expect(creations.filter((log) => log.targetId === groupId).map((log) => log.outcome)).toEqual([
      "success",
      "failure",
      "success",
    ])
    expect(reviews.filter((log) => log.targetId === reportId)).toMatchObject([
      { outcome: "success", actorId: moderator.userId, targetType: "groupReport" },
      { outcome: "failure", reason: "GROUP_REPORT_NOT_PENDING" },
    ])
  })

  test("rejects an unknown reason", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const groupId = await seedGroup(services, userId, `report-bad-${userId}`)
    const res = await api(app, `/groups/${groupId}/reports`, {
      method: "POST",
      headers,
      json: { reason: "LOW_QUALITY" },
    })

    expect(res.status).toBe(422)
  })
})
