import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
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

    const mine = await api(app, "/users/me/overview", { headers: user.headers })
    const theirs = await api(app, "/users/me/overview", { headers: reviewer.headers })

    expect(mine.body).toMatchObject({
      data: {
        chapters: { pending: 1, accepted: 0, rejected: 1 },
        queues: { chapters: null, suggestions: null, groupRequests: null },
      },
    })
    expect(theirs.body).toMatchObject({
      data: { queues: { chapters: 1, suggestions: 0, groupRequests: null } },
    })
  })
})
