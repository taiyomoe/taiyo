import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { config } from "@taiyomoe/config"
import { getChapterPageKey } from "@taiyomoe/s3"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedMembership } from "../helpers/seed"
import { test } from "../setup"

const create = (
  app: Parameters<typeof api>[0],
  mediaId: string,
  headers: Record<string, string>,
  json: Record<string, unknown> = {},
) =>
  api<{ id: string; status: string }>(app, `/medias/${mediaId}/chapters`, {
    method: "POST",
    headers,
    json: { number: 1, language: "en", ...json },
  })
const getChapter = ({ db }: Services, id: string) =>
  db
    .selectFrom("chapters")
    .select([
      "status",
      "number",
      "title",
      "reviewerId",
      "rejectionReason",
      "pages",
      "deletedAt",
      "createdAt",
    ])
    .where("id", "=", id)
    .executeTakeFirstOrThrow()
const setup = async (services: Services) => {
  const admin = await signInAs(services, { role: "ADMIN" })
  const reviewer = await signInAs(services, { role: "UPLOADER" })
  const submitter = await signInAs(services)
  const mediaId = await seedMedia(services, admin.userId)
  const groupId = await seedGroup(services, admin.userId, `G ${randomUUID()}`)
  const pageIds = [randomUUID(), randomUUID(), randomUUID()]
  const pending = await seedChapter(services, {
    mediaId,
    uploaderId: submitter.userId,
    number: 7,
    status: "PENDING",
    pages: pageIds.map((id) => ({ id })),
    createdAt: new Date("2026-01-01T00:00:00Z"),
  })

  return { admin, reviewer, submitter, mediaId, groupId, pageIds, pending }
}

describe("submitting", () => {
  test("regular users, interns and moderators send chapters to review", async ({
    app,
    services,
  }) => {
    const { mediaId, groupId } = await setup(services)

    for (const role of ["USER", "UPLOADER_INTERN", "MODERATOR"] as const) {
      const { headers } = await signInAs(services, { role })
      const res = await create(app, mediaId, headers, { groupIds: [groupId] })

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ data: { status: "PENDING" } })
    }
  })

  test("uploaders, admins and members publishing for their group go live", async ({
    app,
    services,
  }) => {
    const { admin, reviewer, mediaId, groupId } = await setup(services)
    const member = await signInAs(services)

    await seedMembership(services, {
      groupId,
      userId: member.userId,
      permissions: ["UPLOAD_CHAPTERS"],
    })

    for (const headers of [admin.headers, reviewer.headers]) {
      expect((await create(app, mediaId, headers)).body).toMatchObject({
        data: { status: "PUBLISHED" },
      })
    }

    expect(
      (await create(app, mediaId, member.headers, { groupIds: [groupId] })).body,
    ).toMatchObject({ data: { status: "PUBLISHED" } })
  })

  test("a member can still submit a chapter without their group", async ({ app, services }) => {
    const { admin, mediaId, groupId } = await setup(services)
    const other = await seedGroup(services, admin.userId, `O ${randomUUID()}`)
    const member = await signInAs(services)

    await seedMembership(services, {
      groupId,
      userId: member.userId,
      permissions: ["UPLOAD_CHAPTERS"],
    })

    for (const groupIds of [[], [other]]) {
      expect((await create(app, mediaId, member.headers, { groupIds })).body).toMatchObject({
        data: { status: "PENDING" },
      })
    }
  })

  test("a user can have at most the configured number of pending chapters", async ({
    app,
    services,
  }) => {
    const { submitter, mediaId } = await setup(services)

    await services.db
      .insertInto("chapters")
      .values(
        Array.from({ length: config.input.maxPendingChapters - 2 }, (_, index) => ({
          mediaId,
          uploaderId: submitter.userId,
          number: 100 + index,
          language: "en" as const,
          status: "PENDING" as const,
        })),
      )
      .execute()

    expect((await create(app, mediaId, submitter.headers)).status).toBe(201)

    const blocked = await create(app, mediaId, submitter.headers)

    expect(blocked.body).toMatchObject({ code: "CHAPTER_SUBMISSION_LIMIT" })
  })

  test("withdrawn and reviewed chapters do not count toward the limit", async ({
    app,
    services,
  }) => {
    const { submitter, mediaId } = await setup(services)

    await services.db
      .updateTable("chapters")
      .set({ status: "REJECTED" })
      .where("uploaderId", "=", submitter.userId)
      .execute()
    await services.db
      .insertInto("chapters")
      .values(
        Array.from({ length: config.input.maxPendingChapters }, (_, index) => ({
          mediaId,
          uploaderId: submitter.userId,
          number: 100 + index,
          language: "en" as const,
          status: "PENDING" as const,
          deletedAt: new Date(),
        })),
      )
      .execute()

    expect((await create(app, mediaId, submitter.headers)).status).toBe(201)
  })
})

describe("approving", () => {
  test("publishes with the reviewer's fixes and shows up as just released", async ({
    app,
    services,
  }) => {
    const { reviewer, groupId, pending } = await setup(services)
    const res = await api(app, `/chapters/${pending}/approve`, {
      method: "POST",
      headers: reviewer.headers,
      json: { number: 8, title: "Fixed title", groupIds: [groupId] },
    })
    const chapter = await getChapter(services, pending)
    const credits = await services.db
      .selectFrom("chapterGroups")
      .select("groupId")
      .where("chapterId", "=", pending)
      .execute()

    expect(res.status).toBe(201)
    expect(chapter).toMatchObject({
      status: "PUBLISHED",
      number: 8,
      title: "Fixed title",
      reviewerId: reviewer.userId,
    })
    expect(chapter.createdAt.getTime()).toBeGreaterThan(new Date("2026-06-01T00:00:00Z").getTime())
    expect(credits).toEqual([{ groupId }])
  })

  test("requires processed pages", async ({ app, services }) => {
    const { reviewer, pending } = await setup(services)

    await services.db
      .updateTable("chapters")
      .set({ pages: null })
      .where("id", "=", pending)
      .execute()

    const res = await api(app, `/chapters/${pending}/approve`, {
      method: "POST",
      headers: reviewer.headers,
      json: {},
    })

    expect(res.body).toMatchObject({ code: "CHAPTER_PAGES_MISSING" })
  })

  test("only uploaders and admins review", async ({ app, services }) => {
    const { submitter, pending } = await setup(services)

    for (const headers of [
      submitter.headers,
      (await signInAs(services, { role: "MODERATOR" })).headers,
      (await signInAs(services, { role: "UPLOADER_INTERN" })).headers,
    ]) {
      const approve = await api(app, `/chapters/${pending}/approve`, {
        method: "POST",
        headers,
        json: {},
      })
      const reject = await api(app, `/chapters/${pending}/reject`, {
        method: "POST",
        headers,
        json: { reason: "No." },
      })
      const queue = await api(app, "/chapters/review-queue", { headers })

      expect([approve.status, reject.status, queue.status]).toEqual([403, 403, 403])
    }

    expect((await getChapter(services, pending)).status).toBe("PENDING")
  })

  test("a chapter can only be reviewed once", async ({ app, services }) => {
    const { reviewer, admin, pending } = await setup(services)
    const results = await Promise.all([
      api(app, `/chapters/${pending}/approve`, {
        method: "POST",
        headers: reviewer.headers,
        json: {},
      }),
      api(app, `/chapters/${pending}/reject`, {
        method: "POST",
        headers: admin.headers,
        json: { reason: "Duplicate." },
      }),
    ])

    expect(results.map((res) => res.status).sort((a, b) => a - b)).toEqual([201, 409])
  })
})

describe("rejecting", () => {
  test("needs a reason, deletes the pages and keeps the record", async ({ app, services }) => {
    const { reviewer, submitter, mediaId, pageIds, pending } = await setup(services)

    for (const pageId of pageIds) {
      await services.s3.send(
        new PutObjectCommand({
          Bucket: services.s3Bucket,
          Key: getChapterPageKey(mediaId, pending, pageId),
          Body: "page",
        }),
      )
    }

    const empty = await api(app, `/chapters/${pending}/reject`, {
      method: "POST",
      headers: reviewer.headers,
      json: { reason: " " },
    })
    const res = await api(app, `/chapters/${pending}/reject`, {
      method: "POST",
      headers: reviewer.headers,
      json: { reason: "Pages are blurry." },
    })
    const exists = await Promise.all(
      pageIds.map(async (pageId) => {
        try {
          await services.s3.send(
            new HeadObjectCommand({
              Bucket: services.s3Bucket,
              Key: getChapterPageKey(mediaId, pending, pageId),
            }),
          )

          return true
        } catch {
          return false
        }
      }),
    )
    const mine = await api<Array<{ id: string; status: string; rejectionReason: string }>>(
      app,
      "/users/me/chapter-submissions",
      { headers: submitter.headers },
    )

    expect(empty.status).toBe(422)
    expect(res.status).toBe(201)
    expect(exists).toEqual([false, false, false])
    expect(await getChapter(services, pending)).toMatchObject({
      status: "REJECTED",
      rejectionReason: "Pages are blurry.",
      pages: null,
      deletedAt: null,
    })
    expect(mine.body).toMatchObject({
      data: [{ id: pending, status: "REJECTED", rejectionReason: "Pages are blurry." }],
    })
  })
})

describe("submitter", () => {
  test("can edit and withdraw while pending, not once published", async ({ app, services }) => {
    const { reviewer, submitter, mediaId } = await setup(services)
    const editable = await seedChapter(services, {
      mediaId,
      uploaderId: submitter.userId,
      number: 1,
      status: "PENDING",
      pages: [{ id: randomUUID() }],
    })
    const edit = () =>
      api(app, `/chapters/${editable}`, {
        method: "PATCH",
        headers: submitter.headers,
        json: { title: "Mine" },
      })

    expect((await edit()).status).toBe(200)

    await api(app, `/chapters/${editable}/approve`, {
      method: "POST",
      headers: reviewer.headers,
      json: {},
    })

    expect((await edit()).status).toBe(403)

    const withdraw = await api(app, `/chapters/${editable}/withdraw`, {
      method: "POST",
      headers: submitter.headers,
    })

    expect(withdraw.body).toMatchObject({ code: "CHAPTER_NOT_PENDING" })
  })

  test("withdrawing deletes the submission", async ({ app, services }) => {
    const { submitter, pending } = await setup(services)
    const res = await api(app, `/chapters/${pending}/withdraw`, {
      method: "POST",
      headers: submitter.headers,
    })
    const chapter = await getChapter(services, pending)

    expect(res.status).toBe(201)
    expect(chapter.deletedAt).not.toBeNull()
    expect(chapter.pages).toBeNull()
  })

  test("nobody else can withdraw or edit a submission", async ({ app, services }) => {
    const { pending } = await setup(services)
    const stranger = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })

    for (const headers of [stranger.headers, moderator.headers]) {
      const withdraw = await api(app, `/chapters/${pending}/withdraw`, {
        method: "POST",
        headers,
      })
      const edit = await api(app, `/chapters/${pending}`, {
        method: "PATCH",
        headers,
        json: { title: "x" },
      })

      expect(withdraw.status).toBe(404)
      expect(edit.status).toBe(403)
    }
  })
})

describe("pages", () => {
  test("can be reordered by people who can edit the chapter", async ({ app, services }) => {
    const { submitter, pageIds, pending } = await setup(services)
    const reversed = [...pageIds].reverse()
    const res = await api(app, `/chapters/${pending}/pages`, {
      method: "PATCH",
      headers: submitter.headers,
      json: { pageIds: reversed },
    })

    expect(res.status).toBe(200)
    expect((await getChapter(services, pending)).pages).toEqual(reversed.map((id) => ({ id })))
  })

  test("must keep exactly the same pages", async ({ app, services }) => {
    const { submitter, pageIds, pending } = await setup(services)

    for (const ids of [
      pageIds.slice(1),
      [...pageIds, randomUUID()],
      [pageIds[0], pageIds[0], pageIds[1]],
      [randomUUID(), pageIds[1], pageIds[2]],
    ]) {
      const res = await api(app, `/chapters/${pending}/pages`, {
        method: "PATCH",
        headers: submitter.headers,
        json: { pageIds: ids },
      })

      expect(res.body).toMatchObject({ code: "CHAPTER_PAGES_MISMATCH" })
    }
  })

  test("group editors reorder published group chapters, others cannot", async ({
    app,
    services,
  }) => {
    const { admin, mediaId, groupId } = await setup(services)
    const editor = await signInAs(services)
    const uploader = await signInAs(services)
    const pageIds = [randomUUID(), randomUUID()]
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: admin.userId,
      number: 2,
      groupIds: [groupId],
      pages: pageIds.map((id) => ({ id })),
    })

    await seedMembership(services, {
      groupId,
      userId: editor.userId,
      permissions: ["EDIT_CHAPTERS"],
    })
    await seedMembership(services, {
      groupId,
      userId: uploader.userId,
      permissions: ["UPLOAD_CHAPTERS"],
    })

    const reorder = (headers: Record<string, string>) =>
      api(app, `/chapters/${chapterId}/pages`, {
        method: "PATCH",
        headers,
        json: { pageIds: [...pageIds].reverse() },
      })

    expect((await reorder(uploader.headers)).status).toBe(403)
    expect((await reorder(editor.headers)).status).toBe(200)
  })
})

describe("queue", () => {
  test("lists pending chapters oldest first, without published or withdrawn ones", async ({
    app,
    services,
  }) => {
    const { reviewer, submitter, mediaId, pending } = await setup(services)
    const newer = await seedChapter(services, {
      mediaId,
      uploaderId: submitter.userId,
      number: 9,
      status: "PENDING",
      createdAt: new Date("2026-02-01T00:00:00Z"),
    })

    await seedChapter(services, {
      mediaId,
      uploaderId: submitter.userId,
      number: 10,
      status: "PENDING",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    }).then((id) =>
      services.db
        .updateTable("chapters")
        .set({ deletedAt: new Date() })
        .where("id", "=", id)
        .execute(),
    )

    const res = await api<Array<{ id: string; pageCount: number; uploader: { id: string } }>>(
      app,
      "/chapters/review-queue",
      { headers: reviewer.headers },
    )

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((item) => item.id)).toEqual([pending, newer])
    expect(res.body.data[0]).toMatchObject({ pageCount: 3, uploader: { id: submitter.userId } })
  })
})
