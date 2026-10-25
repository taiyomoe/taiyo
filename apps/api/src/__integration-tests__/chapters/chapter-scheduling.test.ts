import { sql } from "@taiyomoe/db"
import { publishScheduledChapters, reapStaleChapterUploads } from "@taiyomoe/queue"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedMembership } from "../helpers/seed"
import { test } from "../setup"

const LINK = "https://sunray-scans.com/chapters/12"
const inHours = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
const setup = async (services: Services) => {
  const admin = await signInAs(services, { role: "ADMIN" })
  const mediaId = await seedMedia(services, admin.userId)

  return { admin, mediaId }
}
const readChapter = (services: Services, id: string) =>
  services.db
    .selectFrom("chapters")
    .select([
      "status",
      "externalUrl",
      "isExternal",
      sql<string | null>`to_char("publishAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("publishAt"),
      sql<string>`to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("createdAt"),
    ])
    .where("id", "=", id)
    .executeTakeFirstOrThrow()
const listedIds = async (app: Parameters<typeof api>[0], path: string) => {
  const res = await api<Array<{ id: string }>>(app, path)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.map((item) => item.id)
}

describe("scheduled chapters", () => {
  test("stay hidden until their release, then come out at that time", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 12,
      status: "SCHEDULED",
      pages: [{ id: randomUUID() }],
      publishInHours: 24,
    })

    expect(await listedIds(app, `/medias/${mediaId}/chapters`)).not.toContain(chapterId)
    expect(await listedIds(app, `/chapters/latest?mediaId=${mediaId}`)).not.toContain(chapterId)
    expect((await api(app, `/chapters/${chapterId}`)).status).toBe(404)
    const stranger = await signInAs(services)

    expect(
      (await api(app, `/chapters/${chapterId}/open`, { method: "POST", headers: stranger.headers }))
        .status,
    ).toBe(404)

    await services.db
      .updateTable("chapters")
      .set({ publishAt: sql<Date>`(CURRENT_TIMESTAMP at time zone 'UTC') - interval '1 minute'` })
      .where("id", "=", chapterId)
      .execute()

    const { published } = await publishScheduledChapters(services)
    const row = await readChapter(services, chapterId)

    expect(published).toBeGreaterThanOrEqual(1)
    expect(row.status).toBe("PUBLISHED")
    expect(row.createdAt).toBe(row.publishAt)
    expect(await listedIds(app, `/medias/${mediaId}/chapters`)).toContain(chapterId)
  })

  test("leave chapters that are not due yet alone", async ({ services }) => {
    const { admin, mediaId } = await setup(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 1,
      status: "SCHEDULED",
      pages: [{ id: randomUUID() }],
      publishInHours: 2,
    })

    await publishScheduledChapters(services)

    expect((await readChapter(services, chapterId)).status).toBe("SCHEDULED")
  })

  test("are listed as upcoming without their link", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const groupId = await seedGroup(services, admin.userId, `G ${randomUUID()}`)
    const later = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 3,
      status: "SCHEDULED",
      pages: [{ id: randomUUID() }],
      publishInHours: 48,
    })
    const sooner = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 2,
      status: "SCHEDULED",
      publishInHours: 24,
      externalUrl: LINK,
      isExternal: true,
      groupIds: [groupId],
    })
    const pending = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 4,
      status: "PENDING",
      pages: [{ id: randomUUID() }],
      publishInHours: 24,
    })
    const res = await api<
      Array<{ id: string; publishAt: string; isExternal: boolean; groups: Array<{ id: string }> }>
    >(app, `/chapters/upcoming?mediaId=${mediaId}`)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((item) => item.id)).toEqual([sooner, later])
    expect(res.body.data[0]).toMatchObject({ isExternal: true, groups: [{ id: groupId }] })
    expect(JSON.stringify(res.body)).not.toContain(LINK)
    expect(JSON.stringify(res.body)).not.toContain(pending)
    expect(new Date(res.body.data[0]?.publishAt ?? 0).getTime()).toBeGreaterThan(Date.now())
    expect(await listedIds(app, `/chapters/upcoming?groupId=${groupId}`)).toEqual([sooner])
  })

  test("can be seen and edited by their group's editors", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const groupId = await seedGroup(services, admin.userId, `G ${randomUUID()}`)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 5,
      status: "SCHEDULED",
      pages: [{ id: randomUUID() }],
      publishInHours: 24,
      groupIds: [groupId],
    })
    const editor = await signInAs(services)
    const member = await signInAs(services)

    await seedMembership(services, {
      groupId,
      userId: editor.userId,
      permissions: ["EDIT_CHAPTERS"],
    })
    await seedMembership(services, { groupId, userId: member.userId })

    const seen = await api<{ status: string; publishAt: string | null }>(
      app,
      `/chapters/${chapterId}`,
      { headers: editor.headers },
    )

    expect(seen.status).toBe(200)
    expect(seen.body).toMatchObject({ data: { status: "SCHEDULED" } })
    expect((await api(app, `/chapters/${chapterId}`, { headers: member.headers })).status).toBe(404)

    const publishAt = inHours(72)
    const rescheduled = await api(app, `/chapters/${chapterId}`, {
      method: "PATCH",
      headers: editor.headers,
      json: { publishAt },
    })

    expect(rescheduled.status).toBe(200)
    expect(await readChapter(services, chapterId)).toMatchObject({
      status: "SCHEDULED",
      publishAt,
    })

    const released = await api(app, `/chapters/${chapterId}`, {
      method: "PATCH",
      headers: editor.headers,
      json: { publishAt: null },
    })

    expect(released.status).toBe(200)
    expect(await readChapter(services, chapterId)).toMatchObject({
      status: "PUBLISHED",
      publishAt: null,
    })
  })

  test("let their uploader move the release, but not edit what was reviewed", async ({
    app,
    services,
  }) => {
    const { admin, mediaId } = await setup(services)
    const submitter = await signInAs(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: submitter.userId,
      number: 15,
      status: "SCHEDULED",
      publishInHours: 24,
      externalUrl: LINK,
      isExternal: true,
    })
    const publishAt = inHours(48)

    await services.db
      .updateTable("chapters")
      .set({ reviewerId: admin.userId })
      .where("id", "=", chapterId)
      .execute()

    for (const json of [
      { externalUrl: "https://elsewhere.example/15" },
      { title: "Changed" },
      { publishAt, externalUrl: "https://elsewhere.example/15" },
    ]) {
      const res = await api(app, `/chapters/${chapterId}`, {
        method: "PATCH",
        headers: submitter.headers,
        json,
      })

      expect({ json, status: res.status }).toEqual({ json, status: 403 })
    }

    const moved = await api(app, `/chapters/${chapterId}`, {
      method: "PATCH",
      headers: submitter.headers,
      json: { publishAt },
    })

    expect(moved.status).toBe(200)
    expect(await readChapter(services, chapterId)).toMatchObject({ publishAt, externalUrl: LINK })
  })

  test("cannot schedule a chapter that is already out", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 6,
      pages: [{ id: randomUUID() }],
    })
    const res = await api(app, `/chapters/${chapterId}`, {
      method: "PATCH",
      headers: admin.headers,
      json: { publishAt: inHours(24) },
    })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ code: "CHAPTER_ALREADY_RELEASED" })
  })

  test("are scheduled once their pages are processed", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const publishAt = inHours(24)
    const created = await api<{ id: string; status: string }>(app, `/medias/${mediaId}/chapters`, {
      method: "POST",
      headers: admin.headers,
      json: { number: 7, language: "en", publishAt, externalUrl: LINK },
    })

    if (!created.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(created.body)}`)
    }

    expect(created.body.data.status).toBe("UPLOADING")
    expect(await readChapter(services, created.body.data.id)).toMatchObject({
      publishAt,
      externalUrl: LINK,
      isExternal: false,
    })
  })

  test("ignore a release time in the past", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const created = await api<{ id: string }>(app, `/medias/${mediaId}/chapters`, {
      method: "POST",
      headers: admin.headers,
      json: { number: 8, language: "en", publishAt: inHours(-1) },
    })

    if (!created.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(created.body)}`)
    }

    expect(await readChapter(services, created.body.data.id)).toMatchObject({ publishAt: null })
  })

  test("wait for review before being scheduled", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const submitter = await signInAs(services)
    const publishAt = inHours(24)
    const created = await api<{ id: string; status: string }>(app, `/medias/${mediaId}/chapters`, {
      method: "POST",
      headers: submitter.headers,
      json: { number: 9, language: "en", publishAt, externalUrl: LINK, isExternal: true },
    })

    if (!created.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(created.body)}`)
    }

    expect(created.body.data.status).toBe("PENDING")

    await services.db
      .updateTable("chapters")
      .set({ createdAt: new Date("2000-01-01T00:00:00Z") })
      .where("id", "=", created.body.data.id)
      .execute()

    const queue = await api<Array<{ id: string }>>(app, "/chapters/review-queue?perPage=10", {
      headers: admin.headers,
    })

    expect(JSON.stringify(queue.body)).toContain(created.body.data.id)

    const approved = await api(app, `/chapters/${created.body.data.id}/approve`, {
      method: "POST",
      headers: admin.headers,
      json: {},
    })

    expect(approved.status).toBe(201)
    expect(await readChapter(services, created.body.data.id)).toMatchObject({
      status: "SCHEDULED",
      publishAt,
    })
  })
})

describe("external chapters", () => {
  test("go live right away and link to the group's site", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const created = await api<{ id: string; status: string }>(app, `/medias/${mediaId}/chapters`, {
      method: "POST",
      headers: admin.headers,
      json: { number: 10, language: "en", externalUrl: LINK, isExternal: true },
    })

    if (!created.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(created.body)}`)
    }

    expect(created.body.data.status).toBe("PUBLISHED")

    const list = await api<Array<{ id: string; externalUrl: string; isExternal: boolean }>>(
      app,
      `/medias/${mediaId}/chapters`,
    )

    expect(list.body).toMatchObject({
      data: [{ id: created.body.data.id, externalUrl: LINK, isExternal: true }],
    })

    const session = await api(app, `/chapters/${created.body.data.id}/pages/upload-session`, {
      method: "POST",
      headers: admin.headers,
      json: { pages: [{ contentType: "image/jpeg", size: 1000 }] },
    })

    expect(session.status).toBe(409)
    expect(session.body).toMatchObject({ code: "CHAPTER_EXTERNAL" })
  })

  test("are scheduled right away when given a release time", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const created = await api<{ id: string; status: string }>(app, `/medias/${mediaId}/chapters`, {
      method: "POST",
      headers: admin.headers,
      json: {
        number: 11,
        language: "en",
        externalUrl: LINK,
        isExternal: true,
        publishAt: inHours(24),
      },
    })

    expect(created.body).toMatchObject({ data: { status: "SCHEDULED" } })
  })

  test("need a web link", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)

    for (const json of [
      { isExternal: true },
      { isExternal: true, externalUrl: null },
      { isExternal: true, externalUrl: "data:text/html,<p>hi</p>" },
      { externalUrl: "ftp://example.com/chapter" },
    ]) {
      const res = await api(app, `/medias/${mediaId}/chapters`, {
        method: "POST",
        headers: admin.headers,
        json: { number: 12, language: "en", ...json },
      })

      expect({ json, status: res.status }).toEqual({ json, status: 422 })
    }
  })

  test("keep their link", async ({ app, services }) => {
    const { admin, mediaId } = await setup(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 13,
      externalUrl: LINK,
      isExternal: true,
    })
    const res = await api(app, `/chapters/${chapterId}`, {
      method: "PATCH",
      headers: admin.headers,
      json: { externalUrl: null },
    })

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ code: "CHAPTER_EXTERNAL_LINK_REQUIRED" })
  })

  test("are not reaped for having no pages", async ({ services }) => {
    const { admin, mediaId } = await setup(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 14,
      status: "PENDING",
      externalUrl: LINK,
      isExternal: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    })

    await reapStaleChapterUploads(services, new Date(Date.now() + 48 * 60 * 60 * 1000))

    const row = await services.db
      .selectFrom("chapters")
      .select("deletedAt")
      .where("id", "=", chapterId)
      .executeTakeFirstOrThrow()

    expect(row.deletedAt).toBeNull()
  })
})
