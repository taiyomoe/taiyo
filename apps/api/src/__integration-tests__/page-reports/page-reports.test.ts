import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { type ApiResult, api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type Report = {
  id: string
  reason: string
  comment: string | null
  status: string
  page: number | null
  pageId: string
  samePageReports: number
  chapter: { id: string; number: number; mediaId: string }
  reporter: { id: string }
}

const dataOf = <TData>(res: ApiResult<TData>) => {
  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const codeOf = (res: ApiResult) => (res.body.success ? null : res.body.code)
const seedPages = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)
  const pages = [{ id: randomUUID() }, { id: randomUUID() }]
  const chapterId = await seedChapter(services, { mediaId, uploaderId, number: 7, pages })

  return { chapterId, pages }
}

describe("page reports", () => {
  test("reports a page once while the report is open", async ({ app, services }) => {
    const { chapterId, pages } = await seedPages(services)
    const { headers } = await signInAs(services)
    const path = `/chapters/${chapterId}/pages/${pages[1]?.id ?? ""}/reports`
    const created = await api<{ id: string }>(app, path, {
      method: "POST",
      headers,
      json: { reason: "BROKEN", comment: "  Half of the image is grey  " },
    })

    expect(created.status).toBe(201)

    const again = await api(app, path, { method: "POST", headers, json: { reason: "OTHER" } })

    expect(again.status).toBe(409)
    expect(codeOf(again)).toBe("PAGE_REPORT_EXISTS")

    const row = await services.db
      .selectFrom("pageReports")
      .select(["comment", "status"])
      .where("id", "=", dataOf(created).id)
      .executeTakeFirstOrThrow()

    expect(row).toEqual({ comment: "Half of the image is grey", status: "OPEN" })
  })

  test("rejects pages outside the chapter and unknown reasons", async ({ app, services }) => {
    const { chapterId, pages } = await seedPages(services)
    const { headers } = await signInAs(services)
    const missing = await api(app, `/chapters/${chapterId}/pages/${randomUUID()}/reports`, {
      method: "POST",
      headers,
      json: { reason: "BROKEN" },
    })
    const invalid = await api(app, `/chapters/${chapterId}/pages/${pages[0]?.id ?? ""}/reports`, {
      method: "POST",
      headers,
      json: { reason: "UGLY" },
    })

    expect(codeOf(missing)).toBe("PAGE_NOT_FOUND")
    expect(invalid.status).toBe(422)
  })

  test("lists open reports for reviewers only", async ({ app, services }) => {
    const { chapterId, pages } = await seedPages(services)
    const first = await signInAs(services)
    const second = await signInAs(services)
    const pageId = pages[0]?.id ?? ""

    for (const { headers } of [first, second]) {
      await api(app, `/chapters/${chapterId}/pages/${pageId}/reports`, {
        method: "POST",
        headers,
        json: { reason: "WRONG_ORDER" },
      })
    }

    const forbidden = await api(app, "/chapters/page-reports", { headers: first.headers })

    expect(forbidden.status).toBe(403)

    const moderator = await signInAs(services, { role: "MODERATOR" })
    const reports = dataOf(
      await api<Report[]>(app, "/chapters/page-reports?perPage=100", {
        headers: moderator.headers,
      }),
    ).filter((report) => report.chapter.id === chapterId)

    expect(reports).toHaveLength(2)
    expect(reports[0]).toMatchObject({
      reason: "WRONG_ORDER",
      status: "OPEN",
      page: 1,
      pageId,
      samePageReports: 2,
      chapter: { number: 7 },
    })
  })

  test("closing a report closes every open report on the same page", async ({ app, services }) => {
    const { chapterId, pages } = await seedPages(services)
    const firstReporter = await signInAs(services)
    const reporters = [firstReporter, await signInAs(services)]
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const ids: string[] = []

    for (const { headers } of reporters) {
      const res = await api<{ id: string }>(
        app,
        `/chapters/${chapterId}/pages/${pages[0]?.id ?? ""}/reports`,
        { method: "POST", headers, json: { reason: "BROKEN" } },
      )

      ids.push(dataOf(res).id)
    }

    const other = await api<{ id: string }>(
      app,
      `/chapters/${chapterId}/pages/${pages[1]?.id ?? ""}/reports`,
      { method: "POST", headers: firstReporter.headers, json: { reason: "LOW_QUALITY" } },
    )
    const closed = await api<{ closed: number }>(app, `/chapters/page-reports/${ids[0] ?? ""}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { status: "RESOLVED" },
    })

    expect(dataOf(closed).closed).toBe(2)

    const statuses = await services.db
      .selectFrom("pageReports")
      .select(["id", "status", "resolverId"])
      .where("chapterId", "=", chapterId)
      .execute()

    expect(statuses).toEqual(
      expect.arrayContaining([
        { id: ids[0], status: "RESOLVED", resolverId: moderator.userId },
        { id: ids[1], status: "RESOLVED", resolverId: moderator.userId },
        { id: dataOf(other).id, status: "OPEN", resolverId: null },
      ]),
    )

    const again = await api(app, `/chapters/page-reports/${ids[1] ?? ""}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { status: "DISMISSED" },
    })

    expect(codeOf(again)).toBe("PAGE_REPORT_CLOSED")

    const reopened = await api(app, `/chapters/${chapterId}/pages/${pages[0]?.id ?? ""}/reports`, {
      method: "POST",
      headers: firstReporter.headers,
      json: { reason: "BROKEN" },
    })

    expect(reopened.status).toBe(201)
  })
})
