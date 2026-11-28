import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { buildDataExport, expireDataExports } from "@taiyomoe/queue"
import { getDataExportKey, getPublicImageUrl } from "@taiyomoe/s3"
import { strFromU8, unzipSync } from "fflate"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const anyNumber: unknown = expect.any(Number)
const anyString: unknown = expect.any(String)
const anyDate: unknown = expect.any(Date)
const DAY_MS = 24 * 60 * 60 * 1000
const SECRETS = {
  passwordHash: "secret-password-hash",
  accessToken: "secret-discord-access-token",
  refreshToken: "secret-discord-refresh-token",
  totpSecret: "secret-totp-seed",
  backupCodes: "secret-backup-codes",
  pushEndpointPath: "secret-push-endpoint",
  pushKey: "secret-push-p256dh",
  pushAuth: "secret-push-auth",
  reportAboutUser: "secret-report-about-the-user",
  moderatorNote: "secret-moderator-note",
  privateListName: "secret-private-list-of-someone-else",
}
const seedPending = async ({ db }: Services, userId: string, createdAt = new Date()) => {
  const row = await db
    .insertInto("dataExports")
    .values({ userId, createdAt })
    .returning("id")
    .executeTakeFirstOrThrow()

  return row.id
}
const readArchive = async (services: Services, userId: string, exportId: string) => {
  const { Body } = await services.s3.send(
    new GetObjectCommand({
      Bucket: services.s3PrivateBucket,
      Key: getDataExportKey(userId, exportId),
    }),
  )

  if (Body === undefined) {
    throw new Error("The archive is empty")
  }

  return unzipSync(await Body.transformToByteArray())
}
const hasArchive = async (services: Services, userId: string, exportId: string) =>
  services.s3
    .send(
      new HeadObjectCommand({
        Bucket: services.s3PrivateBucket,
        Key: getDataExportKey(userId, exportId),
      }),
    )
    .then(() => true)
    .catch(() => false)
/** A user who touched most of the site, with every secret the archive must leave out. */
const seedActiveUser = async (services: Services) => {
  const { db, s3, s3Bucket } = services
  const { userId, headers } = await signInAs(services)
  const other = await signInAs(services)
  const mediaId = await seedMedia(services, other.userId)
  const chapterId = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })
  const avatarKey = `users/${userId}/avatars/${crypto.randomUUID()}.png`

  await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: avatarKey, Body: "avatar-bytes" }))
  await db
    .updateTable("users")
    .set({ image: getPublicImageUrl(avatarKey) })
    .where("id", "=", userId)
    .execute()
  await db
    .insertInto("accounts")
    .values([
      { userId, providerId: "credential", accountId: userId, password: SECRETS.passwordHash },
      {
        userId,
        providerId: "discord",
        accountId: "discord-1",
        accessToken: SECRETS.accessToken,
        refreshToken: SECRETS.refreshToken,
      },
    ])
    .execute()
  await db
    .insertInto("twoFactors")
    .values({ userId, secret: SECRETS.totpSecret, backupCodes: SECRETS.backupCodes })
    .execute()
  await db
    .insertInto("pushSubscriptions")
    .values((eb) => ({
      userId,
      sessionId: eb.selectFrom("sessions").select("id").where("userId", "=", userId).limit(1),
      endpoint: `https://push.example/${SECRETS.pushEndpointPath}`,
      p256dh: SECRETS.pushKey,
      auth: SECRETS.pushAuth,
    }))
    .execute()
  await db.insertInto("userLibraryEntries").values({ userId, mediaId, status: "READING" }).execute()
  await db.insertInto("userHistories").values({ userId, chapterId }).execute()

  const thread = await db
    .insertInto("commentThreads")
    .values({ mediaId })
    .returning("id")
    .executeTakeFirstOrThrow()
  const comment = await db
    .insertInto("comments")
    .values({ threadId: thread.id, authorId: userId, content: "Second version" })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db
    .insertInto("commentRevisions")
    .values({ commentId: comment.id, content: "First version", createdAt: new Date() })
    .execute()
  await db
    .insertInto("userReports")
    .values([
      {
        reporterId: userId,
        userId: other.userId,
        reason: "SPAM",
        reviewerNote: SECRETS.moderatorNote,
      },
      { reporterId: other.userId, userId, reason: "HARASSMENT", details: SECRETS.reportAboutUser },
    ])
    .execute()

  const privateList = await db
    .insertInto("userLists")
    .values({ userId: other.userId, name: SECRETS.privateListName, visibility: "PRIVATE" })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db.insertInto("userListVotes").values({ userId, listId: privateList.id }).execute()

  return { userId, headers, commentId: comment.id, chapterId, privateListId: privateList.id }
}

describe("buildDataExport", () => {
  test("writes every domain of the account and none of its secrets", async ({ services }) => {
    const user = await seedActiveUser(services)
    const exportId = await seedPending(services, user.userId)
    const built = await buildDataExport(services, { exportId })

    expect(built).toMatchObject({ exportId, userId: user.userId, byteSize: anyNumber })

    const files = await readArchive(services, user.userId, exportId)
    const names = Object.keys(files)

    expect(names).toEqual(
      expect.arrayContaining([
        "README.txt",
        "account.json",
        "profile.json",
        "settings.json",
        "library.json",
        "reading-history.json",
        "bookmarks.json",
        "lists.json",
        "list-votes.json",
        "comments.json",
        "comment-votes.json",
        "comment-images.json",
        "favorite-comment-images.json",
        "followed-users.json",
        "followed-groups.json",
        "group-memberships.json",
        "group-invitations.json",
        "reports.json",
        "requests.json",
        "uploaded-chapters.json",
        "mangadex-imports.json",
        "notifications.json",
        "achievements.json",
        "reading-rewards.json",
        "ranking-results.json",
        "cosmetics.json",
        "shop-purchases.json",
        "sessions.json",
        "push-devices.json",
      ]),
    )

    const avatar = names.find((name) => name.startsWith("images/avatar."))

    expect(avatar).toBe("images/avatar.png")
    expect(strFromU8(files[avatar ?? ""] ?? new Uint8Array())).toBe("avatar-bytes")

    const json = (name: string): unknown => JSON.parse(strFromU8(files[name] ?? new Uint8Array()))

    expect(json("account.json")).toMatchObject({
      id: user.userId,
      signInMethods: [{ method: "password" }, { method: "discord" }],
    })
    expect(json("profile.json")).toMatchObject({ avatar: "images/avatar.png" })
    expect(json("comments.json")).toEqual([
      expect.objectContaining({
        id: user.commentId,
        content: "Second version",
        previousVersions: [{ content: "First version", replacedAt: anyString }],
      }),
    ])
    expect(json("uploaded-chapters.json")).toEqual([
      expect.objectContaining({ id: user.chapterId }),
    ])
    expect(json("reports.json")).toEqual([
      expect.objectContaining({ kind: "USER", reason: "SPAM" }),
    ])
    expect(json("list-votes.json")).toEqual([
      expect.objectContaining({ listId: user.privateListId, listName: null }),
    ])
    expect(json("sessions.json")).toHaveLength(1)
    expect(json("push-devices.json")).toHaveLength(1)

    for (const [name, content] of Object.entries(files)) {
      const text = strFromU8(content)

      for (const secret of Object.values(SECRETS)) {
        expect(text, `${name} leaks ${secret}`).not.toContain(secret)
      }
    }

    const sessionToken = await services.db
      .selectFrom("sessions")
      .select("token")
      .where("userId", "=", user.userId)
      .executeTakeFirstOrThrow()

    expect(strFromU8(files["sessions.json"] ?? new Uint8Array())).not.toContain(sessionToken.token)
  })

  test("marks the export ready and notifies the user", async ({ services }) => {
    const { userId } = await signInAs(services)
    const exportId = await seedPending(services, userId)

    await buildDataExport(services, { exportId })

    const row = await services.db
      .selectFrom("dataExports")
      .selectAll()
      .where("id", "=", exportId)
      .executeTakeFirstOrThrow()

    expect(row).toMatchObject({ status: "READY", finishedAt: anyDate })
    expect(Number(row.byteSize)).toBeGreaterThan(0)
    expect(row.expiresAt?.getTime()).toBeGreaterThan(Date.now() + 6 * DAY_MS)

    const notification = await services.db
      .selectFrom("notifications")
      .select(["type", "payload"])
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow()

    expect(notification).toEqual({ type: "DATA_EXPORT_READY", payload: { exportId } })
  })

  test("archives a fresh account with empty lists", async ({ services }) => {
    const { userId } = await signInAs(services)
    const exportId = await seedPending(services, userId)

    await buildDataExport(services, { exportId })

    const files = await readArchive(services, userId, exportId)

    expect(JSON.parse(strFromU8(files["library.json"] ?? new Uint8Array()))).toEqual([])
    expect(JSON.parse(strFromU8(files["profile.json"] ?? new Uint8Array()))).toMatchObject({
      avatar: null,
      banner: null,
    })
  })

  test("does nothing for an export that is no longer pending", async ({ services }) => {
    const { userId } = await signInAs(services)
    const exportId = await seedPending(services, userId)

    await services.db
      .updateTable("dataExports")
      .set({ status: "FAILED" })
      .where("id", "=", exportId)
      .execute()

    expect(await buildDataExport(services, { exportId })).toBeUndefined()
    expect(await hasArchive(services, userId, exportId)).toBe(false)
  })
})

describe("expireDataExports", () => {
  test("deletes archives past their expiry", async ({ services }) => {
    const { userId } = await signInAs(services)
    const exportId = await seedPending(services, userId)

    await buildDataExport(services, { exportId })
    expect(await hasArchive(services, userId, exportId)).toBe(true)

    const notYet = await expireDataExports(services)

    expect(notYet.expired).toEqual([])

    const result = await expireDataExports(services, new Date(Date.now() + 8 * DAY_MS))

    expect(result.expired).toEqual([{ id: exportId, userId }])
    expect(await hasArchive(services, userId, exportId)).toBe(false)

    const row = await services.db
      .selectFrom("dataExports")
      .select("status")
      .where("id", "=", exportId)
      .executeTakeFirstOrThrow()

    expect(row.status).toBe("EXPIRED")
  })

  test("fails an export whose job was lost", async ({ services }) => {
    const { userId } = await signInAs(services)
    const stale = await seedPending(services, userId, new Date(Date.now() - 3 * 60 * 60 * 1000))
    const recent = await seedPending(services, userId)
    const result = await expireDataExports(services)

    expect(result.failed).toEqual([{ id: stale, userId }])

    const rows = await services.db
      .selectFrom("dataExports")
      .select(["id", "status"])
      .where("userId", "=", userId)
      .execute()

    expect(rows).toEqual(
      expect.arrayContaining([
        { id: stale, status: "FAILED" },
        { id: recent, status: "PENDING" },
      ]),
    )
  })
})
