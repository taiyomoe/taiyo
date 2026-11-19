import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const setup = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)
  const pages = [{ id: randomUUID() }, { id: randomUUID() }, { id: randomUUID() }]
  const chapterId = await seedChapter(services, { mediaId, uploaderId, number: 3, pages })
  const report = async (pageIndex: number) => {
    const { userId } = await signInAs(services)
    const [row] = await services.db
      .insertInto("pageReports")
      .values({
        reporterId: userId,
        chapterId,
        pageId: pages[pageIndex]?.id ?? "",
        reason: "BROKEN",
      })
      .returning("id")
      .execute()

    return row?.id ?? ""
  }

  return { chapterId, report }
}

describe("PATCH /chapters/page-reports", () => {
  test("requires a session", async ({ app }) => {
    const res = await api(app, "/chapters/page-reports", {
      method: "PATCH",
      json: { reportIds: [randomUUID()], status: "RESOLVED" },
    })

    expect(res.status).toBe(401)
  })

  test("refuses banned users and readers", async ({ app, services }) => {
    for (const options of [
      { role: "MODERATOR" as const, banned: true },
      { role: "USER" as const },
    ]) {
      const { headers } = await signInAs(services, options)
      const res = await api(app, "/chapters/page-reports", {
        method: "PATCH",
        headers,
        json: { reportIds: [randomUUID()], status: "RESOLVED" },
      })

      expect(res.status).toBe(403)
    }
  })

  test("validates the status", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/chapters/page-reports", {
      method: "PATCH",
      headers,
      json: { reportIds: [randomUUID()], status: "OPEN" },
    })

    expect(res.status).toBe(422)
  })

  test("closes the reports and every open report on their pages", async ({ app, services }) => {
    const { chapterId, report } = await setup(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const first = await report(0)
    const samePage = await report(0)
    const second = await report(1)
    const untouched = await report(2)
    const alreadyClosed = await report(2)

    await services.db
      .updateTable("pageReports")
      .set({ status: "DISMISSED" })
      .where("id", "=", alreadyClosed)
      .execute()

    const missing = randomUUID()
    const res = await api(app, "/chapters/page-reports", {
      method: "PATCH",
      headers: moderator.headers,
      json: { reportIds: [first, samePage, second, alreadyClosed, missing], status: "RESOLVED" },
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      data: {
        done: [first, samePage, second],
        skipped: [
          { id: missing, reason: "NOT_FOUND" },
          { id: alreadyClosed, reason: "CLOSED" },
        ],
        closed: 3,
      },
    })

    const rows = await services.db
      .selectFrom("pageReports")
      .select(["id", "status", "resolverId"])
      .where("chapterId", "=", chapterId)
      .execute()

    expect(rows).toEqual(
      expect.arrayContaining([
        { id: first, status: "RESOLVED", resolverId: moderator.userId },
        { id: samePage, status: "RESOLVED", resolverId: moderator.userId },
        { id: second, status: "RESOLVED", resolverId: moderator.userId },
        { id: untouched, status: "OPEN", resolverId: null },
        { id: alreadyClosed, status: "DISMISSED", resolverId: null },
      ]),
    )
  })
})
