import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia, seedStaff } from "../helpers/seed"
import { test } from "../setup"

type ManagedStaff = {
  id: string
  name: string
  imageUrl: string | null
  mediaCount: number
  roles: string[]
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}
const getData = <T>(res: ApiResult<T>) => {
  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body
}

describe("GET /staffs/managed", () => {
  test("lists the staffs matching the search, newest first, with their medias and roles", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER_INTERN" })
    const older = await seedStaff(services, userId, "Zyxwv Older")
    const newer = await seedStaff(services, userId, "Zyxwv Newer")
    const [first, second, deleted] = await Promise.all([
      seedMedia(services, userId),
      seedMedia(services, userId),
      seedMedia(services, userId),
    ])

    await services.db
      .updateTable("staffs")
      .set({ createdAt: new Date("2020-01-01T00:00:00Z") })
      .where("id", "=", older)
      .execute()
    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", deleted)
      .execute()
    await services.db
      .insertInto("mediaStaffs")
      .values([
        { mediaId: first, staffId: older, role: "ARTIST" },
        { mediaId: first, staffId: older, role: "AUTHOR" },
        { mediaId: second, staffId: older, role: "ARTIST" },
        { mediaId: deleted, staffId: newer, role: "AUTHOR" },
      ])
      .execute()

    const body = getData(
      await api<ManagedStaff[]>(app, "/staffs/managed?search=zyxwv", { headers }),
    )

    expect(body.data.map((staff) => staff.id)).toEqual([newer, older])
    expect(body.meta).toEqual({ page: 1, perPage: 20, total: 2 })
    expect(body.data[0]).toMatchObject({ mediaCount: 0, roles: [], imageUrl: null })
    expect(body.data[1]).toMatchObject({
      name: "Zyxwv Older",
      mediaCount: 2,
      roles: ["AUTHOR", "ARTIST"],
    })

    const paged = getData(
      await api<ManagedStaff[]>(app, "/staffs/managed?search=zyxwv&perPage=1&page=2", { headers }),
    )

    expect(paged.data.map((staff) => staff.id)).toEqual([older])
    expect(paged.meta).toEqual({ page: 2, perPage: 1, total: 2 })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/staffs/managed"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/staffs/managed", { headers }), 403, "FORBIDDEN")
  })

  test("rejects users without the required role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })

    expectFailure(await api(app, "/staffs/managed", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an invalid page", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(await api(app, "/staffs/managed?page=0", { headers }), 422, "VALIDATION_ERROR")
  })
})
