import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { postComment } from "./helpers"

type Report = { id: string; reason: string; details: string | null; reporter: { id: string } }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /comments/:id/reports", () => {
  test("lists every report on the comment, newest first, even once removed", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const author = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const comment = await postComment(app, author.headers, target, "Spoiler ahead")
    const reporters = []

    for (const reason of ["SPAM", "SPOILER", "HARASSMENT", "NSFW", "ILLEGAL", "OTHER"]) {
      const reporter = await signInAs(services)

      await api(app, `/comments/${comment.id}/reports`, {
        method: "POST",
        headers: reporter.headers,
        json: { reason, details: `Because ${reason}` },
      })
      reporters.push(reporter.userId)
    }

    const list = (query: string) =>
      api<Report[]>(app, `/comments/${comment.id}/reports?${query}`, {
        headers: moderator.headers,
      })
    const first = await list("perPage=5")
    const second = await list("perPage=5&page=2")

    expect(first.status).toBe(200)
    expect(first.body).toMatchObject({ meta: { total: 6 } })
    expect(first.body.success && first.body.data.map((report) => report.reporter.id)).toEqual(
      reporters.slice(1).reverse(),
    )
    expect(second.body.success && second.body.data).toMatchObject([
      { reason: "SPAM", details: "Because SPAM", reporter: { id: reporters[0] } },
    ])

    await api(app, `/comments/${comment.id}`, { method: "DELETE", headers: moderator.headers })

    const open = await list("")
    const resolved = await list("status=RESOLVED")

    expect(open.body).toMatchObject({ data: [], meta: { total: 0 } })
    expect(resolved.body).toMatchObject({ meta: { total: 6 } })
  })

  test("rejects an unknown comment with COMMENT_NOT_FOUND", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, `/comments/${randomUUID()}/reports`, { headers })

    expectFailure(res, 404, "COMMENT_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/comments/${randomUUID()}/reports`)

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/comments/${randomUUID()}/reports`, { headers })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects users without the moderator role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })
    const res = await api(app, `/comments/${randomUUID()}/reports`, { headers })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an invalid ID with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/comments/not-a-uuid/reports", { headers })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
