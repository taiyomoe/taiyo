import type { AccountDeletion } from "@taiyomoe/auth/server"
import { DELETED_USER_ID, type DB, isBannedSql, type Kysely, sql } from "@taiyomoe/db"
import {
  DeleteObjectsCommand,
  getDataExportKey,
  getOwnedAvatarKey,
  type S3Client,
} from "@taiyomoe/s3"
import { drainSearchOutbox, type Meilisearch } from "@taiyomoe/search"
import z from "zod"

export const deletionBlockersSchema = z.object({
  ownedGroups: z
    .object({
      id: z.uuid().meta({ description: "The ID of the group." }),
      name: z.string().meta({ description: "The name of the group." }),
    })
    .array()
    .meta({
      description:
        "The groups you own. Transfer each one to another member, or delete it, before deleting your account.",
    }),
  lastAdmin: z.boolean().meta({
    description: "Whether you are the only admin: another user must be made admin first.",
  }),
})

export const getDeletionBlockers = async (db: Kysely<DB>, userId: string) => {
  const [ownedGroups, otherAdmin, user] = await Promise.all([
    db
      .selectFrom("groupMemberships as m")
      .innerJoin("groups as g", "g.id", "m.groupId")
      .select(["g.id", "g.name"])
      .where("m.userId", "=", userId)
      .where("m.role", "=", "OWNER")
      .where("g.deletedAt", "is", null)
      .orderBy("g.name")
      .execute(),
    db
      .selectFrom("users")
      .select("id")
      .where("role", "=", "ADMIN")
      .where("id", "!=", userId)
      .where((eb) => eb.or([eb("banned", "is", null), eb("banned", "=", false)]))
      .limit(1)
      .executeTakeFirst(),
    db.selectFrom("users").select("role").where("id", "=", userId).executeTakeFirst(),
  ])

  return { ownedGroups, lastAdmin: user?.role === "ADMIN" && otherAdmin === undefined }
}

/** What keeps the user from deleting their account now, as an error code, or null. */
const getBlockerCode = async (db: Kysely<DB>, userId: string) => {
  // A ban revokes every session, but one left over must not let a banned user leave and come back.
  const banned = await db
    .selectFrom("users")
    .select("id")
    .where("id", "=", userId)
    .where(isBannedSql, "=", true)
    .executeTakeFirst()

  if (banned !== undefined) {
    return "BANNED_USER"
  }

  const { ownedGroups, lastAdmin } = await getDeletionBlockers(db, userId)

  if (ownedGroups.length > 0) {
    return "ACCOUNT_OWNS_GROUPS"
  }

  return lastAdmin ? "ACCOUNT_LAST_ADMIN" : null
}

/** What is left to delete outside the database once the account is gone. */
type Leftovers = {
  publicKeys: string[]
  privateKeys: string[]
}

/**
 * Deletes the account in one transaction. Personal data goes with the user row through its
 * cascading foreign keys. What other people still use stays, credited to the "Deleted user"
 * account: the catalog entries and chapters the user created, the reviews and moderation they
 * did, and the comment images someone else reuses. Comments stay for their replies, without an
 * author or text, and read as deleted.
 */
const deleteAccountData = async (db: Kysely<DB>, userId: string) =>
  db.transaction().execute(async (trx) => {
    // Locks every admin, so two admins deleting themselves at once cannot leave none.
    await trx.selectFrom("users").select("id").where("role", "=", "ADMIN").forUpdate().execute()

    const user = await trx
      .selectFrom("users")
      .leftJoin("userProfiles as p", "p.userId", "users.id")
      .select(["users.image", "p.banner"])
      .where("users.id", "=", userId)
      .forUpdate("users")
      .executeTakeFirst()

    if (user === undefined) {
      return { blocker: null, leftovers: null }
    }

    const blocker = await getBlockerCode(trx, userId)

    if (blocker !== null) {
      return { blocker, leftovers: null }
    }

    const reassign = (table: keyof DB, column: string) =>
      sql`update ${sql.table(table)} set ${sql.ref(column)} = ${DELETED_USER_ID} where ${sql.ref(column)} = ${userId}`.execute(
        trx,
      )
    const sharedImage = sql<boolean>`(
      exists (
        select 1 from "commentImageUsages" as "u"
        inner join "comments" as "c" on "c"."id" = "u"."commentId"
        where "u"."imageId" = "commentImages"."id" and "c"."authorId" is distinct from ${userId}
      )
      or exists (
        select 1 from "commentImageFavorites" as "f"
        where "f"."imageId" = "commentImages"."id" and "f"."userId" != ${userId}
      )
    )`
    const [images, exports] = await Promise.all([
      trx
        .selectFrom("commentImages")
        .select("key")
        .where("uploaderId", "=", userId)
        .where(sharedImage, "=", false)
        .execute(),
      trx.selectFrom("dataExports").select("id").where("userId", "=", userId).execute(),
    ])

    await trx
      .updateTable("commentImages")
      .set({ uploaderId: DELETED_USER_ID })
      .where("uploaderId", "=", userId)
      .where(sharedImage, "=", true)
      .execute()
    await trx
      .updateTable("comments")
      .set((eb) => ({ upvoteCount: eb("upvoteCount", "-", 1) }))
      .where("id", "in", (eb) =>
        eb.selectFrom("commentVotes").select("commentId").where("userId", "=", userId),
      )
      .execute()
    await trx
      .updateTable("userLists")
      .set((eb) => ({ upvoteCount: eb("upvoteCount", "-", 1) }))
      .where("id", "in", (eb) =>
        eb.selectFrom("userListVotes").select("listId").where("userId", "=", userId),
      )
      .execute()
    // Their comments read as deleted from now on: there is nothing left to moderate.
    await trx
      .updateTable("commentReports")
      .set({ status: "DISMISSED", resolvedAt: sql<Date>`CURRENT_TIMESTAMP` })
      .where("status", "=", "OPEN")
      .where("commentId", "in", (eb) =>
        eb.selectFrom("comments").select("id").where("authorId", "=", userId),
      )
      .execute()

    // Comments stay for the replies under them but never show again: their text goes now.
    await trx
      .deleteFrom("commentRevisions")
      .where("commentId", "in", (eb) =>
        eb.selectFrom("comments").select("id").where("authorId", "=", userId),
      )
      .execute()
    await trx
      .updateTable("comments")
      .set({ content: "[deleted]", editedAt: null })
      .where("authorId", "=", userId)
      .execute()

    for (const [table, column] of REASSIGNED_COLUMNS) {
      await reassign(table, column)
    }

    // The trigger on readingRewards rebuilds readerTotals as rows go: they leave first.
    await trx.deleteFrom("readingRewards").where("userId", "=", userId).execute()
    await trx.deleteFrom("readerTotals").where("userId", "=", userId).execute()
    await trx.deleteFrom("userProfiles").where("userId", "=", userId).execute()
    await trx.deleteFrom("users").where("id", "=", userId).execute()

    const avatarKey = getOwnedAvatarKey(userId, user.image)

    return {
      blocker: null,
      leftovers: {
        publicKeys: [
          ...(avatarKey === null ? [] : [avatarKey]),
          ...(user.banner === null ? [] : [user.banner]),
          ...images.map(({ key }) => key),
        ],
        privateKeys: exports.map(({ id }) => getDataExportKey(userId, id)),
      } satisfies Leftovers,
    }
  })

/**
 * The columns that record who made or reviewed something other people still see. They move to
 * the "Deleted user" account instead of following the user out: the restrict ones would block the
 * deletion, and a null reviewer would read as a chapter nobody approved.
 *
 * @internal Exported for its tests.
 */
export const REASSIGNED_COLUMNS = [
  ["banners", "uploaderId"],
  ["banners", "deleterId"],
  ["blockedCommentImages", "blockerId"],
  ["chapters", "uploaderId"],
  ["chapters", "reviewerId"],
  ["chapters", "deleterId"],
  ["commentImages", "removerId"],
  ["commentReports", "resolverId"],
  ["comments", "deleterId"],
  ["covers", "uploaderId"],
  ["covers", "deleterId"],
  ["groupCreationRequests", "reviewerId"],
  ["groupMemberships", "addedBy"],
  ["groupOwnershipRequests", "reviewerId"],
  ["groupReports", "reviewerId"],
  ["groups", "creatorId"],
  ["groups", "deleterId"],
  ["mediaSuggestions", "reviewerId"],
  ["medias", "creatorId"],
  ["medias", "deleterId"],
  ["pageReports", "resolverId"],
  ["sessions", "impersonatedBy"],
  ["staffs", "creatorId"],
  ["staffs", "deleterId"],
  ["titles", "creatorId"],
  ["titles", "deleterId"],
  ["userReports", "reviewerId"],
] as const satisfies ReadonlyArray<readonly [keyof DB, string]>

const deleteObjects = async (s3: S3Client, bucket: string, keys: string[]) => {
  for (let i = 0; i < keys.length; i += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: keys.slice(i, i + 1000).map((key) => ({ Key: key })) },
      }),
    )
  }
}

export const createAccountDeletion = ({
  db,
  s3,
  s3Bucket,
  s3PrivateBucket,
  meili,
  mediasIndex,
  webOrigin,
  onError,
}: {
  db: Kysely<DB>
  s3: S3Client
  s3Bucket: string
  s3PrivateBucket: string
  meili: Meilisearch
  mediasIndex: string
  webOrigin: string
  onError: (err: unknown) => void
}): AccountDeletion => {
  const leftovers = new Map<string, Leftovers>()

  return {
    getBlocker: (userId) => getBlockerCode(db, userId),
    getConfirmUrl: (token) => `${webOrigin}/account/delete?token=${encodeURIComponent(token)}`,
    deleteAccount: async (userId) => {
      const result = await deleteAccountData(db, userId)

      if (result.leftovers !== null) {
        leftovers.set(userId, result.leftovers)
      }

      return result.blocker
    },
    afterDelete: async (userId) => {
      const left = leftovers.get(userId)

      leftovers.delete(userId)

      // The account is already gone: nothing retries a failure here, so it is logged.
      await Promise.all([
        left === undefined ? undefined : deleteObjects(s3, s3Bucket, left.publicKeys),
        left === undefined ? undefined : deleteObjects(s3, s3PrivateBucket, left.privateKeys),
        drainSearchOutbox({ db, meili, mediasIndex }, { taskTimeoutMs: 2_000 }),
      ]).catch(onError)
    },
  }
}
