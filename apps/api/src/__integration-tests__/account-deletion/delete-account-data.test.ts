import type { Hono } from "hono"
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { DELETED_USER_ID, sql } from "@taiyomoe/db"
import { getDataExportKey, getPublicImageUrl } from "@taiyomoe/s3"
import { randomInt, randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { REASSIGNED_COLUMNS } from "../../utils/account-deletion"
import { signInAs } from "../helpers/auth"
import { seedChapter, seedGroup, seedMedia, seedMembership } from "../helpers/seed"
import { test } from "../setup"

type Reference = { table: string; column: string; action: string }

/**
 * Every foreign key to `users`, and what its ON DELETE does. A new one fails this test until
 * `deleteAccountData` handles it: cascade for personal data, a reassignment to the "Deleted
 * user" account for what other people still use, or a delete before the user's own row.
 */
const EXPECTED_REFERENCES = [
  "accounts.userId: CASCADE",
  "banners.uploaderId: RESTRICT (reassigned)",
  "blockedCommentImages.blockerId: SET NULL (reassigned)",
  "chapters.reviewerId: SET NULL (reassigned)",
  "chapters.uploaderId: RESTRICT (reassigned)",
  "commentImageFavorites.userId: CASCADE",
  "commentImages.removerId: SET NULL (reassigned)",
  "commentImages.uploaderId: CASCADE",
  "commentReports.reporterId: CASCADE",
  "commentReports.resolverId: SET NULL (reassigned)",
  "commentThreads.profileId: CASCADE",
  "commentVotes.userId: CASCADE",
  "comments.authorId: SET NULL",
  "comments.deleterId: SET NULL (reassigned)",
  "covers.uploaderId: RESTRICT (reassigned)",
  "dataExports.userId: CASCADE",
  "groupCreationRequests.reviewerId: SET NULL (reassigned)",
  "groupCreationRequests.userId: CASCADE",
  "groupFollows.userId: CASCADE",
  "groupInvitations.inviteeId: CASCADE",
  "groupInvitations.inviterId: CASCADE",
  "groupMemberships.addedBy: RESTRICT (reassigned)",
  "groupMemberships.userId: CASCADE",
  "groupOwnershipRequests.reviewerId: SET NULL (reassigned)",
  "groupOwnershipRequests.userId: CASCADE",
  "groupReports.reporterId: CASCADE",
  "groupReports.reviewerId: SET NULL (reassigned)",
  "groups.creatorId: RESTRICT (reassigned)",
  "mangaDexSyncs.userId: CASCADE",
  "mediaSuggestions.authorId: CASCADE",
  "mediaSuggestions.reviewerId: SET NULL (reassigned)",
  "medias.creatorId: RESTRICT (reassigned)",
  "notificationActors.actorId: CASCADE",
  "notifications.userId: CASCADE",
  "pageBookmarks.userId: CASCADE",
  "pageReports.reporterId: CASCADE",
  "pageReports.resolverId: SET NULL (reassigned)",
  "pushSubscriptions.userId: CASCADE",
  "rankingResults.userId: CASCADE",
  "readerTotals.userId: CASCADE (deleted first)",
  "readingRewards.userId: CASCADE (deleted first)",
  "sessions.userId: CASCADE",
  "shopPurchases.userId: CASCADE",
  "staffs.creatorId: RESTRICT (reassigned)",
  "titles.creatorId: RESTRICT (reassigned)",
  "twoFactors.userId: CASCADE",
  "userAchievements.userId: CASCADE",
  "userCosmetics.userId: CASCADE",
  "userFollows.followerId: CASCADE",
  "userFollows.followingId: CASCADE",
  "userHistories.userId: CASCADE",
  "userLibraryEntries.userId: CASCADE",
  "userListVotes.userId: CASCADE",
  "userLists.userId: CASCADE",
  "userProfiles.userId: RESTRICT (deleted first)",
  "userReports.reporterId: CASCADE",
  "userReports.reviewerId: SET NULL (reassigned)",
  "userReports.userId: CASCADE",
]
const DELETED_FIRST = new Set([
  "readerTotals.userId",
  "readingRewards.userId",
  "userProfiles.userId",
])
const ACTIONS: Record<string, string> = {
  a: "NO ACTION",
  c: "CASCADE",
  n: "SET NULL",
  r: "RESTRICT",
}
const FK_LESS_COLUMNS = REASSIGNED_COLUMNS.filter(
  ([table, column]) => column === "deleterId" || `${table}.${column}` === "sessions.impersonatedBy",
)
const listReferences = async ({ db }: Services) => {
  const { rows } = await sql<{ table: string; column: string; action: string }>`
    select cl.relname as "table", a.attname as "column", c.confdeltype as "action"
    from pg_constraint c
    join pg_class cl on cl.oid = c.conrelid
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f' and c.confrelid = '"users"'::regclass
    order by 1, 2
  `.execute(db)

  return rows.map(({ table, column, action }) => ({
    table,
    column,
    action: ACTIONS[action] ?? action,
  }))
}
const describeReference = ({ table, column, action }: Reference) => {
  const key = `${table}.${column}`

  if (REASSIGNED_COLUMNS.some(([t, c]) => `${t}.${c}` === key)) {
    return `${key}: ${action} (reassigned)`
  }

  return DELETED_FIRST.has(key) ? `${key}: ${action} (deleted first)` : `${key}: ${action}`
}
const countReferences = async ({ db }: Services, { table, column }: Reference, value: string) => {
  const { rows } = await sql<{ count: number }>`
    select count(*)::int as "count" from ${sql.table(table)} where ${sql.ref(column)}::text = ${value}
  `.execute(db)

  return rows[0]?.count ?? 0
}
const hasObject = async ({ s3 }: Services, bucket: string, key: string) =>
  s3
    .send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    .then(() => true)
    .catch(() => false)
const deleteUser = (app: Hono, headers: Record<string, string>, json: unknown) =>
  app.request("/api/auth/delete-user", {
    method: "POST",
    headers: {
      ...headers,
      origin: "http://localhost",
      "content-type": "application/json",
      "cf-connecting-ip": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
    },
    body: JSON.stringify(json),
  })
/** A user who left a trace in every table that references users. */
const seedEverything = async (services: Services) => {
  const { db, s3, s3Bucket, s3PrivateBucket } = services
  const user = await signInAs(services)
  const other = await signInAs(services)
  const { userId } = user
  const otherId = other.userId
  const mediaId = await seedMedia(services, otherId)
  const ownMediaId = await seedMedia(services, userId)
  const chapterId = await seedChapter(services, { mediaId, uploaderId: otherId, number: 1 })
  const ownChapterId = await seedChapter(services, { mediaId, uploaderId: userId, number: 2 })
  const groupId = await seedGroup(services, otherId, `Other ${otherId.slice(0, 8)}`)
  const ownGroupId = await seedGroup(services, userId, `Made ${userId.slice(0, 8)}`)
  const avatarKey = `users/${userId}/avatars/${randomUUID()}.png`
  const bannerKey = `users/${userId}/banners/${randomUUID()}.png`
  const ownImageKey = `comments/${randomUUID()}.webp`
  const sharedImageKey = `comments/${randomUUID()}.webp`
  const image = (uploaderId: string, key: string) => ({
    uploaderId,
    key,
    width: 10,
    height: 10,
    animated: false,
    byteSize: 100,
    sha256: randomUUID(),
    dhash: String(randomInt(1_000_000)),
  })

  for (const key of [avatarKey, bannerKey, ownImageKey, sharedImageKey]) {
    await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: key, Body: "image" }))
  }

  await db
    .updateTable("users")
    .set({ image: getPublicImageUrl(avatarKey) })
    .where("id", "=", userId)
    .execute()
  await db.insertInto("userProfiles").values({ userId, banner: bannerKey }).execute()
  await db
    .insertInto("accounts")
    .values({ userId, providerId: "credential", accountId: userId, password: "hash" })
    .execute()
  await db.insertInto("twoFactors").values({ userId, secret: "s", backupCodes: "b" }).execute()
  await db
    .insertInto("pushSubscriptions")
    .values((eb) => ({
      userId,
      sessionId: eb.selectFrom("sessions").select("id").where("userId", "=", userId).limit(1),
      endpoint: `https://push.example/${userId}`,
      p256dh: "k",
      auth: "a",
    }))
    .execute()
  await db
    .updateTable("sessions")
    .set({ impersonatedBy: userId })
    .where("userId", "=", otherId)
    .execute()

  const exportRow = await db
    .insertInto("dataExports")
    .values({ userId, status: "READY" })
    .returning("id")
    .executeTakeFirstOrThrow()
  const exportKey = getDataExportKey(userId, exportRow.id)

  await s3.send(new PutObjectCommand({ Bucket: s3PrivateBucket, Key: exportKey, Body: "zip" }))

  // Catalog entries the user made, and staff work they did on other people's.
  await db
    .insertInto("banners")
    .values({ mediaId, uploaderId: userId, deleterId: userId })
    .execute()
  await db.insertInto("covers").values({ mediaId, uploaderId: userId, language: "en" }).execute()
  await db
    .insertInto("titles")
    .values({ mediaId, creatorId: userId, title: "A title", language: "en", priority: 9 })
    .execute()
  await db
    .insertInto("staffs")
    .values({ name: `Staff ${userId}`, creatorId: userId })
    .execute()
  await db.updateTable("medias").set({ deleterId: userId }).where("id", "=", ownMediaId).execute()
  await db
    .updateTable("chapters")
    .set({ reviewerId: userId, deleterId: userId })
    .where("id", "=", chapterId)
    .execute()
  await db.updateTable("groups").set({ deleterId: userId }).where("id", "=", ownGroupId).execute()
  await seedMembership(services, { groupId, userId: otherId, role: "OWNER" })
  await db
    .updateTable("groupMemberships")
    .set({ addedBy: userId })
    .where("userId", "=", otherId)
    .execute()
  await seedMembership(services, { groupId, userId })
  await db.insertInto("groupFollows").values({ userId, groupId }).execute()
  await db
    .insertInto("groupInvitations")
    .values([
      {
        groupId,
        inviteeId: userId,
        inviterId: otherId,
        expiresAt: sql<Date>`CURRENT_TIMESTAMP + interval '7 days'`,
      },
      {
        groupId: ownGroupId,
        inviteeId: otherId,
        inviterId: userId,
        expiresAt: sql<Date>`CURRENT_TIMESTAMP + interval '7 days'`,
      },
    ])
    .execute()
  await db
    .insertInto("groupCreationRequests")
    .values([
      { userId, name: "Mine", message: "Please" },
      { userId: otherId, name: "Theirs", message: "Please", reviewerId: userId },
    ])
    .execute()
  await db
    .insertInto("groupOwnershipRequests")
    .values([
      { userId, groupId },
      { userId: otherId, groupId: ownGroupId, reviewerId: userId },
    ])
    .execute()
  await db
    .insertInto("groupReports")
    .values([
      { groupId, reporterId: userId, reason: "SPAM" },
      { groupId: ownGroupId, reporterId: otherId, reason: "SPAM", reviewerId: userId },
    ])
    .execute()
  await db
    .insertInto("mediaSuggestions")
    .values([
      { mediaId, authorId: userId, changes: { type: "MANHWA" }, base: { type: "MANGA" } },
      {
        mediaId,
        authorId: otherId,
        changes: { type: "MANHWA" },
        base: { type: "MANGA" },
        reviewerId: userId,
      },
    ])
    .execute()
  await db
    .insertInto("mangaDexSyncs")
    .values({ mediaId, userId, mangaDexId: randomUUID() })
    .execute()
  await db
    .insertInto("pageReports")
    .values([
      { chapterId, pageId: randomUUID(), reporterId: userId, reason: "BROKEN" },
      {
        chapterId,
        pageId: randomUUID(),
        reporterId: otherId,
        reason: "BROKEN",
        resolverId: userId,
      },
    ])
    .execute()
  await db
    .insertInto("userReports")
    .values([
      { userId: otherId, reporterId: userId, reason: "SPAM" },
      { userId, reporterId: otherId, reason: "SPAM" },
      { userId: otherId, reporterId: otherId, reason: "OTHER", reviewerId: userId },
    ])
    .execute()

  // Reading, lists and rewards.
  await db.insertInto("userLibraryEntries").values({ userId, mediaId, status: "READING" }).execute()
  await db.insertInto("userHistories").values({ userId, chapterId }).execute()
  await db.insertInto("pageBookmarks").values({ userId, chapterId, pageId: randomUUID() }).execute()
  await db
    .insertInto("readingRewards")
    .values({ userId, chapterId, mediaId, number: 1, pages: 10, points: 5 })
    .execute()

  const period = await db
    .insertInto("rankingPeriods")
    .values({
      kind: "WEEK",
      startsAt: new Date("2020-01-06T00:00:00Z"),
      endsAt: new Date("2020-01-13T00:00:00Z"),
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db
    .insertInto("rankingResults")
    .values({ periodId: period.id, rank: 1, userId, chapters: 1, pages: 10, points: 5 })
    .execute()
  await db.insertInto("userAchievements").values({ userId, key: "FIRST_CHAPTER" }).execute()
  await db.insertInto("userCosmetics").values({ userId, kind: "TITLE", key: "reader" }).execute()
  await db
    .insertInto("shopPurchases")
    .values({ userId, type: "ITEM", cosmeticKind: "TITLE", cosmeticKey: "reader", price: 10 })
    .execute()

  const ownList = await db
    .insertInto("userLists")
    .values({ userId, name: "Mine" })
    .returning("id")
    .executeTakeFirstOrThrow()
  const otherList = await db
    .insertInto("userLists")
    .values({ userId: otherId, name: "Theirs", upvoteCount: 1 })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db
    .insertInto("userListItems")
    .values({ listId: ownList.id, mediaId, position: 0 })
    .execute()
  await db.insertInto("userListVotes").values({ userId, listId: otherList.id }).execute()
  await db
    .insertInto("userFollows")
    .values([
      { followerId: userId, followingId: otherId },
      { followerId: otherId, followingId: userId },
    ])
    .execute()

  const followNotification = await db
    .insertInto("notifications")
    .values({ userId: otherId, type: "FOLLOW" })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db
    .insertInto("notificationActors")
    .values({ notificationId: followNotification.id, actorId: userId })
    .execute()
  await db.insertInto("notifications").values({ userId, type: "FOLLOW" }).execute()

  // Comments, their images, votes and reports.
  const thread = await db
    .insertInto("commentThreads")
    .values({ mediaId })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db.insertInto("commentThreads").values({ profileId: userId }).execute()

  const ownComment = await db
    .insertInto("comments")
    .values({
      threadId: thread.id,
      authorId: userId,
      content: "Personal words",
      editedAt: new Date(),
    })
    .returning("id")
    .executeTakeFirstOrThrow()
  const otherComment = await db
    .insertInto("comments")
    .values({ threadId: thread.id, authorId: otherId, content: "Reply", upvoteCount: 1 })
    .returning("id")
    .executeTakeFirstOrThrow()
  const removedComment = await db
    .insertInto("comments")
    .values({
      threadId: thread.id,
      authorId: otherId,
      content: "Rude",
      deletedAt: new Date(),
      deletion: "MODERATOR",
      deleterId: userId,
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db
    .insertInto("commentRevisions")
    .values({ commentId: ownComment.id, content: "Earlier words", createdAt: new Date() })
    .execute()
  await db.insertInto("commentVotes").values({ userId, commentId: otherComment.id }).execute()

  const ownImage = await db
    .insertInto("commentImages")
    .values(image(userId, ownImageKey))
    .returning("id")
    .executeTakeFirstOrThrow()
  const sharedImage = await db
    .insertInto("commentImages")
    .values(image(userId, sharedImageKey))
    .returning("id")
    .executeTakeFirstOrThrow()
  const removedImage = await db
    .insertInto("commentImages")
    .values({
      ...image(otherId, `comments/${randomUUID()}.webp`),
      removedAt: new Date(),
      removerId: userId,
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  await db
    .insertInto("commentImageUsages")
    .values([
      { commentId: ownComment.id, imageId: ownImage.id },
      { commentId: otherComment.id, imageId: sharedImage.id },
    ])
    .execute()
  await db
    .insertInto("commentImageFavorites")
    .values({ userId, imageId: removedImage.id })
    .execute()
  await db
    .insertInto("blockedCommentImages")
    .values({ sha256: randomUUID(), dhash: "1", width: 10, height: 10, blockerId: userId })
    .execute()
  await db
    .insertInto("commentReports")
    .values([
      { commentId: otherComment.id, reporterId: userId, reason: "SPAM" },
      { commentId: ownComment.id, reporterId: otherId, reason: "SPAM" },
      {
        commentId: removedComment.id,
        reporterId: otherId,
        reason: "SPAM",
        resolverId: userId,
        status: "RESOLVED",
      },
    ])
    .execute()

  return {
    ...user,
    otherId,
    keys: { avatarKey, bannerKey, ownImageKey, sharedImageKey, exportKey },
    ids: {
      ownChapterId,
      ownGroupId,
      ownComment: ownComment.id,
      otherComment: otherComment.id,
      otherList: otherList.id,
      sharedImage: sharedImage.id,
    },
  }
}

describe("account deletion", () => {
  test("handles every foreign key to users", async ({ services }) => {
    const references = await listReferences(services)

    expect(references.map(describeReference)).toEqual(EXPECTED_REFERENCES)
  })

  test("removes every trace of the user and keeps what others still use", async ({
    app,
    services,
    authMails,
  }) => {
    const seeded = await seedEverything(services)
    const { userId, otherId, keys, ids } = seeded
    const request = (json: unknown) => deleteUser(app, seeded.headers, json)

    await services.db.deleteFrom("accounts").where("userId", "=", userId).execute()
    expect((await request({})).status).toBe(200)

    const mail = authMails.find((candidate) => candidate.kind === "delete-account")
    const token =
      mail !== undefined && "url" in mail ? new URL(mail.url).searchParams.get("token") : null
    const res = await request({ token })

    expect(res.status).toBe(200)

    for (const reference of await listReferences(services)) {
      expect(
        await countReferences(services, reference, userId),
        `${reference.table}.${reference.column} still points at the user`,
      ).toBe(0)
    }

    for (const [table, column] of FK_LESS_COLUMNS) {
      expect(
        await countReferences(services, { table, column, action: "" }, userId),
        `${table}.${column} still points at the user`,
      ).toBe(0)
    }

    const { db } = services
    const reassigned = await db
      .selectFrom("chapters")
      .select(["uploaderId"])
      .where("id", "=", ids.ownChapterId)
      .executeTakeFirstOrThrow()
    const group = await db
      .selectFrom("groups")
      .select(["creatorId", "deleterId"])
      .where("id", "=", ids.ownGroupId)
      .executeTakeFirstOrThrow()
    const comments = await db
      .selectFrom("comments")
      .select(["id", "authorId", "content", "editedAt", "upvoteCount"])
      .where("id", "in", [ids.ownComment, ids.otherComment])
      .orderBy("createdAt")
      .execute()
    const list = await db
      .selectFrom("userLists")
      .select("upvoteCount")
      .where("id", "=", ids.otherList)
      .executeTakeFirstOrThrow()
    const sharedImage = await db
      .selectFrom("commentImages")
      .select("uploaderId")
      .where("id", "=", ids.sharedImage)
      .executeTakeFirstOrThrow()
    const reports = await db
      .selectFrom("commentReports")
      .select("status")
      .where("commentId", "=", ids.ownComment)
      .execute()

    expect(reassigned.uploaderId).toBe(DELETED_USER_ID)
    expect(group).toEqual({ creatorId: DELETED_USER_ID, deleterId: DELETED_USER_ID })
    expect(comments).toEqual([
      { id: ids.ownComment, authorId: null, content: "[deleted]", editedAt: null, upvoteCount: 0 },
      { id: ids.otherComment, authorId: otherId, content: "Reply", editedAt: null, upvoteCount: 0 },
    ])
    expect(list.upvoteCount).toBe(0)
    expect(sharedImage.uploaderId).toBe(DELETED_USER_ID)
    expect(reports).toEqual([{ status: "DISMISSED" }])

    const revisions = await db
      .selectFrom("commentRevisions")
      .select("id")
      .where("commentId", "=", ids.ownComment)
      .execute()

    expect(revisions).toEqual([])
    expect(await hasObject(services, services.s3Bucket, keys.avatarKey)).toBe(false)
    expect(await hasObject(services, services.s3Bucket, keys.bannerKey)).toBe(false)
    expect(await hasObject(services, services.s3Bucket, keys.ownImageKey)).toBe(false)
    expect(await hasObject(services, services.s3Bucket, keys.sharedImageKey)).toBe(true)
    expect(await hasObject(services, services.s3PrivateBucket, keys.exportKey)).toBe(false)

    const other = await db.selectFrom("users").select("id").where("id", "=", otherId).execute()

    expect(other).toHaveLength(1)
  })
})
