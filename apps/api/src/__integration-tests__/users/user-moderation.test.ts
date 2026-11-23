import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { postComment } from "../comments/helpers"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type ManagedUser = {
  id: string
  role: string
  banned: boolean
  banReason: string | null
  banExpires: string | null
  email: string | null
}

const ban = (
  app: Parameters<typeof api>[0],
  userId: string,
  headers: Record<string, string>,
  json: unknown = { reason: "Spam." },
) => api(app, `/users/${userId}/ban`, { method: "POST", headers, json })
const userRow = ({ db }: Services, id: string) =>
  db
    .selectFrom("users")
    .select(["role", "banned", "banReason", "banExpires"])
    .where("id", "=", id)
    .executeTakeFirstOrThrow()

describe("roles", () => {
  test("only admins change roles, never their own", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const target = await signInAs(services)
    const byModerator = await api(app, `/users/${target.userId}/role`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { role: "UPLOADER" },
    })
    const own = await api(app, `/users/${admin.userId}/role`, {
      method: "PATCH",
      headers: admin.headers,
      json: { role: "USER" },
    })
    const byAdmin = await api(app, `/users/${target.userId}/role`, {
      method: "PATCH",
      headers: admin.headers,
      json: { role: "UPLOADER" },
    })
    const after = await api(app, "/medias", {
      method: "POST",
      headers: target.headers,
      form: new FormData(),
    })

    expect(byModerator.status).toBe(403)
    expect(own.status).toBe(403)
    expect(byAdmin.status).toBe(200)
    expect((await userRow(services, target.userId)).role).toBe("UPLOADER")
    expect(after.status).not.toBe(403)
  })

  test("unequips the cosmetics the new role does not unlock", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const equipped = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers: moderator.headers,
      json: { title: "moderator", nameEffect: "azure" },
    })

    expect(equipped.status).toBe(200)

    const res = await api(app, `/users/${moderator.userId}/role`, {
      method: "PATCH",
      headers: admin.headers,
      json: { role: "UPLOADER" },
    })
    const row = await services.db
      .selectFrom("users")
      .leftJoin("userProfiles", "userProfiles.userId", "users.id")
      .select(["users.role", "users.nameEffect", "userProfiles.title"])
      .where("users.id", "=", moderator.userId)
      .executeTakeFirstOrThrow()

    expect(res.status).toBe(200)
    expect(row).toEqual({ role: "UPLOADER", nameEffect: null, title: null })
  })

  test("are refused to a non-admin before the user is looked up", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const missing = await api(app, `/users/${crypto.randomUUID()}/role`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { role: "UPLOADER" },
    })
    const invalid = await api(app, "/users/not-a-uuid/role", {
      method: "PATCH",
      headers: moderator.headers,
      json: {},
    })

    expect(missing.status).toBe(403)
    expect(invalid.status).toBe(403)
  })
})

describe("ban rights", () => {
  test("are checked before the user is looked up", async ({ app, services }) => {
    const user = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const missingId = crypto.randomUUID()
    const unban = (userId: string, headers: Record<string, string>) =>
      api(app, `/users/${userId}/unban`, { method: "POST", headers })

    expect((await ban(app, missingId, user.headers)).status).toBe(403)
    expect((await unban(missingId, user.headers)).status).toBe(403)
    expect((await ban(app, "not-a-uuid", user.headers, {})).status).toBe(403)
    expect((await ban(app, missingId, moderator.headers)).status).toBe(404)
    expect((await unban(missingId, moderator.headers)).status).toBe(404)
  })
})

describe("role cosmetics", () => {
  test("are unequipped when the role that grants them is removed", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const equipped = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers: moderator.headers,
      json: { title: "moderator", nameEffect: "azure" },
    })

    expect(equipped.status).toBe(200)

    await api(app, `/users/${moderator.userId}/role`, {
      method: "PATCH",
      headers: admin.headers,
      json: { role: "USER" },
    })

    const row = await services.db
      .selectFrom("users")
      .leftJoin("userProfiles", "userProfiles.userId", "users.id")
      .select(["users.nameEffect", "userProfiles.title"])
      .where("users.id", "=", moderator.userId)
      .executeTakeFirstOrThrow()

    expect(row).toEqual({ nameEffect: null, title: null })
  })

  test("stay equipped when the new role still grants them", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })

    await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers: moderator.headers,
      json: { nameEffect: "azure" },
    })
    await api(app, `/users/${moderator.userId}/role`, {
      method: "PATCH",
      headers: admin.headers,
      json: { role: "ADMIN" },
    })

    const row = await services.db
      .selectFrom("users")
      .select("nameEffect")
      .where("id", "=", moderator.userId)
      .executeTakeFirstOrThrow()

    expect(row.nameEffect).toBe("azure")
  })
})

describe("bans", () => {
  test("moderators ban regular users only, admins anyone but themselves", async ({
    app,
    services,
  }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const uploader = await signInAs(services, { role: "UPLOADER" })
    const otherModerator = await signInAs(services, { role: "MODERATOR" })

    expect((await ban(app, uploader.userId, moderator.headers)).status).toBe(403)
    expect((await ban(app, otherModerator.userId, moderator.headers)).status).toBe(403)
    expect((await ban(app, moderator.userId, moderator.headers)).status).toBe(403)
    expect((await ban(app, admin.userId, admin.headers)).status).toBe(403)
    expect((await ban(app, user.userId, moderator.headers)).status).toBe(201)
    expect((await ban(app, uploader.userId, admin.headers)).status).toBe(201)
  })

  test("signs the user out and blocks them right away", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const res = await ban(app, user.userId, moderator.headers, { reason: "Spam.", days: 7 })
    const sessions = await services.db
      .selectFrom("sessions")
      .select("id")
      .where("userId", "=", user.userId)
      .execute()
    const row = await userRow(services, user.userId)

    expect(res.status).toBe(201)
    expect(sessions).toEqual([])
    expect(row).toMatchObject({ banned: true, banReason: "Spam." })
    expect(row.banExpires).not.toBeNull()
  })

  test("rejects what the user had waiting for review", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const user = await signInAs(services)
    const mediaId = await seedMedia(services, admin.userId)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: user.userId,
      number: 1,
      status: "PENDING",
      pages: [{ id: "00000000-0000-4000-8000-000000000001" }],
    })
    const suggestion = await api<{ id: string }>(app, `/medias/${mediaId}/suggestions`, {
      method: "POST",
      headers: user.headers,
      json: { changes: { type: "MANHWA" } },
    })
    const res = await ban(app, user.userId, admin.headers)
    const chapter = await services.db
      .selectFrom("chapters")
      .select(["status", "pages", "rejectionReason"])
      .where("id", "=", chapterId)
      .executeTakeFirstOrThrow()
    const suggestions = await services.db
      .selectFrom("mediaSuggestions")
      .select("status")
      .where("authorId", "=", user.userId)
      .execute()

    expect(suggestion.status).toBe(201)
    expect(res.body).toMatchObject({ data: { rejectedChapters: 1 } })
    expect(chapter).toEqual({
      status: "REJECTED",
      pages: null,
      rejectionReason: "This account was banned.",
    })
    expect(suggestions).toEqual([{ status: "REJECTED" }])
  })

  test("an expired ban no longer blocks anything", async ({ app, services }) => {
    const user = await signInAs(services)

    await services.db
      .updateTable("users")
      .set({ banned: true, banExpires: new Date("2000-01-01T00:00:00Z") })
      .where("id", "=", user.userId)
      .execute()

    const res = await api(app, "/users/me/overview", { headers: user.headers })

    expect(res.status).toBe(200)
  })

  test("lifting a ban restores access", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)

    await services.db
      .updateTable("users")
      .set({ banned: true, banReason: "Spam." })
      .where("id", "=", user.userId)
      .execute()

    const blocked = await api(app, "/users/me/overview", { headers: user.headers })
    const lifted = await api(app, `/users/${user.userId}/unban`, {
      method: "POST",
      headers: moderator.headers,
    })
    const after = await api(app, "/users/me/overview", { headers: user.headers })

    expect(blocked.status).toBe(403)
    expect(lifted.status).toBe(201)
    expect(after.status).toBe(200)
    expect(await userRow(services, user.userId)).toMatchObject({ banned: false, banReason: null })
  })
})

describe("GET /users", () => {
  test("is for moderators and admins, and only admins see emails", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const uploader = await signInAs(services, { role: "UPLOADER" })
    const target = await signInAs(services, { email: "someone@test.local" })
    const search = `?search=${target.userId.replace(/-/g, "").slice(0, 12)}`
    const asAdmin = await api<ManagedUser[]>(app, `/users${search}`, { headers: admin.headers })
    const asModerator = await api<ManagedUser[]>(app, `/users${search}`, {
      headers: moderator.headers,
    })
    const asUploader = await api(app, "/users", { headers: uploader.headers })

    expect(asUploader.status).toBe(403)
    expect(asAdmin.body).toMatchObject({
      data: [{ id: target.userId, email: "someone@test.local", banned: false }],
    })
    expect(asModerator.body).toMatchObject({ data: [{ id: target.userId, email: null }] })
  })

  test("filters banned users", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const banned = await signInAs(services)

    await ban(app, banned.userId, admin.headers)

    const res = await api<ManagedUser[]>(app, "/users?banned=true&perPage=100", {
      headers: admin.headers,
    })

    expect(res.body).toMatchObject({ data: [{ id: banned.userId, banned: true }] })
  })
})

describe("GET /users/me/overview", () => {
  test("counts the user's work and the queues they can review", async ({ app, services }) => {
    const reviewer = await signInAs(services, { role: "UPLOADER" })
    const user = await signInAs(services)
    const mediaId = await seedMedia(services, reviewer.userId)

    await seedChapter(services, {
      mediaId,
      uploaderId: user.userId,
      number: 1,
      status: "PENDING",
      pages: [{ id: "00000000-0000-4000-8000-000000000002" }],
    })
    await seedChapter(services, { mediaId, uploaderId: user.userId, number: 2, status: "REJECTED" })
    const scheduledId = await seedChapter(services, {
      mediaId,
      uploaderId: user.userId,
      number: 3,
      status: "SCHEDULED",
      publishInHours: 24,
    })

    await services.db
      .updateTable("chapters")
      .set({ reviewerId: reviewer.userId })
      .where("id", "=", scheduledId)
      .execute()

    const mine = await api(app, "/users/me/overview", { headers: user.headers })
    const theirs = await api(app, "/users/me/overview", { headers: reviewer.headers })

    expect(mine.body).toMatchObject({
      data: {
        chapters: { pending: 1, accepted: 1, rejected: 1 },
        queues: { chapters: null, suggestions: null, groupRequests: null, userReports: null },
      },
    })
    expect(theirs.body).toMatchObject({
      data: { queues: { chapters: 1, suggestions: 0, groupRequests: null, userReports: null } },
    })
  })
  test("counts the report queues for the moderators", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const getQueues = async (headers: Record<string, string>) => {
      const res = await api<{ queues: Record<string, number | null> }>(app, "/users/me/overview", {
        headers,
      })

      if (!res.body.success) {
        throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
      }

      return res.body.data.queues
    }
    const before = await getQueues(moderator.headers)
    const mediaId = await seedMedia(services, moderator.userId)
    const pageId = "00000000-0000-4000-8000-000000000003"
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: moderator.userId,
      number: 1,
      status: "PUBLISHED",
      pages: [{ id: pageId }],
    })
    const groupId = await seedGroup(services, moderator.userId, "Reported Scans")
    const comment = await postComment(
      app,
      user.headers,
      { type: "MEDIA", id: mediaId },
      "Reported comment",
    )

    await services.db
      .insertInto("pageReports")
      .values({ reporterId: user.userId, chapterId, pageId, reason: "BROKEN" })
      .execute()
    await services.db
      .insertInto("commentReports")
      .values([
        { commentId: comment.id, reporterId: user.userId, reason: "SPAM" },
        { commentId: comment.id, reporterId: moderator.userId, reason: "SPAM" },
      ])
      .execute()
    await services.db
      .insertInto("groupReports")
      .values({ groupId, reporterId: user.userId, reason: "SPAM" })
      .execute()

    const review = await services.db
      .insertInto("mediaReviews")
      .values({ userId: user.userId, mediaId, body: "A reported review. ".repeat(12) })
      .returning("id")
      .executeTakeFirstOrThrow()

    await services.db
      .insertInto("mediaReviewReports")
      .values([
        { reviewId: review.id, reporterId: moderator.userId, reason: "SPOILER" },
        { reviewId: review.id, reporterId: (await signInAs(services)).userId, reason: "SPAM" },
      ])
      .execute()

    const after = await getQueues(moderator.headers)

    expect(after).toMatchObject({
      pageReports: (before.pageReports ?? 0) + 1,
      commentReports: (before.commentReports ?? 0) + 1,
      reviewReports: (before.reviewReports ?? 0) + 1,
      groupReports: (before.groupReports ?? 0) + 1,
    })
    expect(await getQueues(user.headers)).toMatchObject({
      pageReports: null,
      commentReports: null,
      reviewReports: null,
      groupReports: null,
    })
  })

  test("counts the pending user reports for moderators", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const reported = await signInAs(services)
    const reporter = await signInAs(services)
    const other = await signInAs(services)

    await services.db
      .insertInto("userReports")
      .values([
        { userId: reported.userId, reporterId: reporter.userId, reason: "SPAM" },
        { userId: reported.userId, reporterId: other.userId, reason: "SPAM", status: "RESOLVED" },
      ])
      .execute()

    const res = await api(app, "/users/me/overview", { headers: moderator.headers })

    expect(res.body).toMatchObject({ data: { queues: { userReports: 1 } } })
  })
})
