import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia, seedStaff, seedTitle } from "../helpers/seed"
import { test } from "../setup"

const setup = async (services: Services) => {
  const uploader = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploader.userId)
  const mainTitleId = await seedTitle(services, {
    mediaId,
    creatorId: uploader.userId,
    title: "Main",
    isMainTitle: true,
  })
  const authorId = await seedStaff(services, uploader.userId, "Author")
  const artistId = await seedStaff(services, uploader.userId, "Artist")

  await services.db
    .insertInto("mediaStaffs")
    .values({ mediaId, staffId: authorId, role: "AUTHOR" })
    .execute()

  return { uploader, mediaId, mainTitleId, authorId, artistId }
}
const patch = (
  app: Parameters<typeof api>[0],
  mediaId: string,
  headers: Record<string, string>,
  json: unknown,
) => api(app, `/medias/${mediaId}`, { method: "PATCH", headers, json })

describe("PATCH /medias/:id", () => {
  test("replaces titles, keeping the ids of the ones that stay", async ({ app, services }) => {
    const { uploader, mediaId, mainTitleId } = await setup(services)
    const res = await patch(app, mediaId, uploader.headers, {
      titles: [
        { title: "Second", language: "en" },
        { title: "Main", language: "en", isMainTitle: true },
        { title: "MN", language: "en", isAcronym: true },
        { title: "メイン", language: "ja" },
      ],
    })
    const titles = await services.db
      .selectFrom("titles")
      .select(["id", "title", "language", "priority", "isMainTitle", "isAcronym"])
      .where("mediaId", "=", mediaId)
      .orderBy("language")
      .orderBy("priority")
      .execute()

    expect(res.status).toBe(200)
    expect(titles).toEqual([
      {
        id: mainTitleId,
        title: "Main",
        language: "en",
        priority: 1,
        isMainTitle: true,
        isAcronym: false,
      },
      expect.objectContaining({ title: "Second", language: "en", priority: 2 }),
      expect.objectContaining({ title: "MN", language: "en", priority: 3, isAcronym: true }),
      expect.objectContaining({ title: "メイン", language: "ja", priority: 1 }),
    ])
  })

  test("needs exactly one main title and no duplicates", async ({ app, services }) => {
    const { uploader, mediaId } = await setup(services)
    const none = await patch(app, mediaId, uploader.headers, {
      titles: [{ title: "A", language: "en" }],
    })
    const two = await patch(app, mediaId, uploader.headers, {
      titles: [
        { title: "A", language: "en", isMainTitle: true },
        { title: "B", language: "en", isMainTitle: true },
      ],
    })
    const duplicate = await patch(app, mediaId, uploader.headers, {
      titles: [
        { title: "A", language: "en", isMainTitle: true },
        { title: "a", language: "en" },
      ],
    })

    expect([none.status, two.status, duplicate.status]).toEqual([422, 422, 422])
  })

  test("replaces staff credits", async ({ app, services }) => {
    const { uploader, mediaId, authorId, artistId } = await setup(services)
    const res = await patch(app, mediaId, uploader.headers, {
      staffs: [
        { staffId: artistId, role: "ARTIST" },
        { staffId: authorId, role: "ARTIST" },
      ],
    })
    const staffs = await services.db
      .selectFrom("mediaStaffs")
      .select(["staffId", "role"])
      .where("mediaId", "=", mediaId)
      .execute()

    expect(res.status).toBe(200)
    expect(staffs).toEqual(
      expect.arrayContaining([
        { staffId: artistId, role: "ARTIST" },
        { staffId: authorId, role: "ARTIST" },
      ]),
    )
    expect(staffs).toHaveLength(2)
  })

  test("rejects unknown staff members", async ({ app, services }) => {
    const { uploader, mediaId } = await setup(services)
    const res = await patch(app, mediaId, uploader.headers, {
      staffs: [{ staffId: "00000000-0000-4000-8000-000000000000", role: "AUTHOR" }],
    })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: "STAFF_NOT_FOUND" })
  })

  test("only accepts http(s) links", async ({ app, services }) => {
    const { uploader, mediaId } = await setup(services)
    const script = await patch(app, mediaId, uploader.headers, {
      links: { raw: ["javascript", "alert(1)"].join(":") },
    })
    const https = await patch(app, mediaId, uploader.headers, {
      links: { raw: "https://example.com/raw" },
    })

    expect(script.status).toBe(422)
    expect(https.status).toBe(200)
  })

  test("refuses links that belong to another media", async ({ app, services }) => {
    const { uploader, mediaId } = await setup(services)
    const other = await seedMedia(services, uploader.userId)

    await patch(app, other, uploader.headers, { links: { anilist: 42 } })

    const res = await patch(app, mediaId, uploader.headers, { links: { anilist: 42 } })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({
      code: "MEDIA_LINK_CONFLICT",
      details: { conflictingMediaId: other },
    })
  })

  test("stores dates as given and clears them with null", async ({ app, services }) => {
    const { uploader, mediaId } = await setup(services)

    await patch(app, mediaId, uploader.headers, { startDate: "2020-03-01T00:00:00Z" })

    const set = await api<{ current: { startDate: string | null } }>(
      app,
      `/medias/${mediaId}/edit`,
      { headers: uploader.headers },
    )

    await patch(app, mediaId, uploader.headers, { startDate: null })

    const cleared = await api<{ current: { startDate: string | null } }>(
      app,
      `/medias/${mediaId}/edit`,
      { headers: uploader.headers },
    )

    expect(set.body).toMatchObject({ data: { current: { startDate: "2020-03-01T00:00:00.000Z" } } })
    expect(cleared.body).toMatchObject({ data: { current: { startDate: null } } })
  })

  test("is open to interns, uploaders, moderators and admins only", async ({ app, services }) => {
    const { mediaId } = await setup(services)
    const statuses: Record<string, number> = {}

    for (const role of ["USER", "UPLOADER_INTERN", "MODERATOR", "ADMIN"] as const) {
      const { headers } = await signInAs(services, { role })

      statuses[role] = (await patch(app, mediaId, headers, { status: "FINISHED" })).status
    }

    expect(statuses).toEqual({ USER: 403, UPLOADER_INTERN: 200, MODERATOR: 200, ADMIN: 200 })
  })
})
