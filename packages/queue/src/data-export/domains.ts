import type { DB, Json } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { type Kysely, sql } from "kysely"
import { jsonArrayFrom } from "kysely/helpers/postgres"
import {
  serializeAchievement,
  serializeBookmark,
  serializeComment,
  serializeCommentVote,
  serializeCosmetic,
  serializeFavoriteImage,
  serializeFollowedGroup,
  serializeFollowedUser,
  serializeGroupCreationRequest,
  serializeGroupInvitation,
  serializeGroupMembership,
  serializeGroupOwnershipRequest,
  serializeHistoryEntry,
  serializeLibraryEntry,
  serializeList,
  serializeListVote,
  serializeMangaDexSync,
  serializeMediaSuggestion,
  serializeNotification,
  serializePushDevice,
  serializeRankingResult,
  serializeReadingReward,
  serializeReport,
  serializeSession,
  serializeShopPurchase,
  serializeUploadedChapter,
} from "./serializers"

type Page = { limit: number; offset: number }

/** A JSON array file of the archive, read a page at a time so a heavy user never sits in memory. */
export type ExportListFile = {
  name: string
  description: string
  rows: (db: Kysely<DB>, userId: string) => AsyncGenerator
}

const paged = <Row>(
  load: (db: Kysely<DB>, userId: string, page: Page) => Promise<Row[]>,
  serialize: (row: Row) => unknown,
) =>
  async function* rows(db: Kysely<DB>, userId: string) {
    const limit = config.dataExports.pageSize

    for (let offset = 0; ; offset += limit) {
      const batch = await load(db, userId, { limit, offset })

      for (const row of batch) {
        yield serialize(row)
      }

      if (batch.length < limit) {
        return
      }
    }
  }
// Timestamps inside JSON aggregates come back as text without their UTC zone.
const jsonTimestamp = (value: Date | string) =>
  typeof value === "string" ? new Date(`${value}Z`).toISOString() : value.toISOString()
const concat = (...sources: Array<ExportListFile["rows"]>) =>
  async function* rows(db: Kysely<DB>, userId: string) {
    for (const source of sources) {
      yield* source(db, userId)
    }
  }
const mainTitle = (mediaId: string) =>
  sql<string | null>`(
    select "t"."title" from "titles" as "t"
    where "t"."mediaId" = ${sql.ref(mediaId)} and "t"."isMainTitle" and "t"."deletedAt" is null
    limit 1
  )`

export const EXPORT_LIST_FILES: readonly ExportListFile[] = [
  {
    name: "library.json",
    description: "The titles in your library, with their reading status.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("userLibraryEntries as e")
          .select([
            "e.mediaId",
            "e.status",
            "e.notify",
            "e.createdAt",
            "e.updatedAt",
            mainTitle("e.mediaId").as("mediaTitle"),
          ])
          .where("e.userId", "=", userId)
          .orderBy("e.createdAt")
          .orderBy("e.mediaId")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeLibraryEntry,
    ),
  },
  {
    name: "reading-history.json",
    description: "Every chapter you opened, the last page you were on and whether you finished it.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("userHistories as h")
          .innerJoin("chapters as c", "c.id", "h.chapterId")
          .select([
            "h.chapterId",
            "c.number as chapterNumber",
            "c.mediaId",
            "h.pageId",
            "h.completed",
            "h.createdAt",
            "h.updatedAt",
            mainTitle("c.mediaId").as("mediaTitle"),
          ])
          .where("h.userId", "=", userId)
          .orderBy("h.createdAt")
          .orderBy("h.chapterId")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeHistoryEntry,
    ),
  },
  {
    name: "bookmarks.json",
    description: "The pages you bookmarked.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("pageBookmarks as b")
          .innerJoin("chapters as c", "c.id", "b.chapterId")
          .select([
            "b.id",
            "b.chapterId",
            "c.number as chapterNumber",
            "c.mediaId",
            "b.pageId",
            "b.createdAt",
            mainTitle("c.mediaId").as("mediaTitle"),
          ])
          .where("b.userId", "=", userId)
          .orderBy("b.createdAt")
          .orderBy("b.id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeBookmark,
    ),
  },
  {
    name: "lists.json",
    description: "Your custom lists, private ones included, and the titles in them.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("userLists as l")
          .select((eb) => [
            "l.id",
            "l.name",
            "l.description",
            "l.visibility",
            "l.upvoteCount",
            "l.createdAt",
            "l.updatedAt",
            "l.deletedAt",
            jsonArrayFrom(
              eb
                .selectFrom("userListItems as i")
                .select([
                  "i.mediaId",
                  "i.position",
                  "i.addedAt",
                  mainTitle("i.mediaId").as("mediaTitle"),
                ])
                .whereRef("i.listId", "=", "l.id")
                .orderBy("i.position"),
            ).as("items"),
          ])
          .where("l.userId", "=", userId)
          .orderBy("l.createdAt")
          .orderBy("l.id")
          .limit(limit)
          .offset(offset)
          .execute(),
      (row) =>
        serializeList({
          ...row,
          items: row.items.map((item) => ({ ...item, addedAt: jsonTimestamp(item.addedAt) })),
        }),
    ),
  },
  {
    name: "list-votes.json",
    description:
      "The lists you upvoted. The name of another user's list only shows while it is public.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("userListVotes as v")
          .innerJoin("userLists as l", "l.id", "v.listId")
          .select([
            "v.listId",
            "v.createdAt",
            sql<
              string | null
            >`case when "l"."userId" = ${userId} or ("l"."visibility" = 'PUBLIC' and "l"."deletedAt" is null) then "l"."name" end`.as(
              "listName",
            ),
          ])
          .where("v.userId", "=", userId)
          .orderBy("v.createdAt")
          .orderBy("v.listId")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeListVote,
    ),
  },
  {
    name: "comments.json",
    description:
      "Every comment you posted, removed ones included, with the earlier versions of the ones you edited.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("comments as c")
          .innerJoin("commentThreads as t", "t.id", "c.threadId")
          .select((eb) => [
            "c.id",
            "c.parentId",
            "c.replyToId",
            "t.mediaId",
            "t.chapterId",
            "t.groupId",
            "t.profileId as profileUserId",
            "c.content",
            "c.upvoteCount",
            "c.createdAt",
            "c.editedAt",
            "c.deletedAt",
            "c.deletion",
            jsonArrayFrom(
              eb
                .selectFrom("commentRevisions as r")
                .select(["r.content", "r.createdAt"])
                .whereRef("r.commentId", "=", "c.id")
                .orderBy("r.createdAt"),
            ).as("revisions"),
          ])
          .where("c.authorId", "=", userId)
          .orderBy("c.createdAt")
          .orderBy("c.id")
          .limit(limit)
          .offset(offset)
          .execute(),
      (row) =>
        serializeComment({
          ...row,
          revisions: row.revisions.map((revision) => ({
            ...revision,
            createdAt: jsonTimestamp(revision.createdAt),
          })),
        }),
    ),
  },
  {
    name: "comment-votes.json",
    description: "The comments you upvoted.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("commentVotes")
          .select(["commentId", "createdAt"])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("commentId")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeCommentVote,
    ),
  },
  {
    name: "favorite-comment-images.json",
    description: "The comment images you saved to your favorites.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("commentImageFavorites")
          .select(["imageId", "createdAt"])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("imageId")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeFavoriteImage,
    ),
  },
  {
    name: "followed-users.json",
    description: "The people you follow.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("userFollows as f")
          .innerJoin("users as u", "u.id", "f.followingId")
          .select(["f.followingId", "u.username", "u.displayUsername"])
          .where("f.followerId", "=", userId)
          .orderBy("u.username")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeFollowedUser,
    ),
  },
  {
    name: "followed-groups.json",
    description: "The groups you follow.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("groupFollows as f")
          .innerJoin("groups as g", "g.id", "f.groupId")
          .select(["f.groupId", "g.name as groupName", "f.createdAt"])
          .where("f.userId", "=", userId)
          .orderBy("f.createdAt")
          .orderBy("f.groupId")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeFollowedGroup,
    ),
  },
  {
    name: "group-memberships.json",
    description: "The groups you belong to, your role and your permissions in each.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("groupMemberships as m")
          .innerJoin("groups as g", "g.id", "m.groupId")
          .select(["m.groupId", "g.name as groupName", "m.role", "m.permissions", "m.createdAt"])
          .where("m.userId", "=", userId)
          .orderBy("m.createdAt")
          .orderBy("m.groupId")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeGroupMembership,
    ),
  },
  {
    name: "group-invitations.json",
    description: "The invitations to join a group you received.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("groupInvitations as i")
          .innerJoin("groups as g", "g.id", "i.groupId")
          .select([
            "i.id",
            "i.groupId",
            "g.name as groupName",
            "i.status",
            "i.permissions",
            "i.createdAt",
            "i.expiresAt",
          ])
          .where("i.inviteeId", "=", userId)
          .orderBy("i.createdAt")
          .orderBy("i.id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeGroupInvitation,
    ),
  },
  {
    name: "reports.json",
    description:
      "The reports you filed about comments, chapter pages, groups and users, and where they stand.",
    rows: concat(
      paged(
        (db, userId, { limit, offset }) =>
          db
            .selectFrom("commentReports")
            .select([
              "id",
              sql<"COMMENT">`'COMMENT'`.as("kind"),
              "commentId",
              "reason",
              "details",
              "status",
              "createdAt",
            ])
            .where("reporterId", "=", userId)
            .orderBy("createdAt")
            .orderBy("id")
            .limit(limit)
            .offset(offset)
            .execute(),
        serializeReport,
      ),
      paged(
        (db, userId, { limit, offset }) =>
          db
            .selectFrom("pageReports")
            .select([
              "id",
              sql<"PAGE">`'PAGE'`.as("kind"),
              "chapterId",
              "pageId",
              "reason",
              "comment as details",
              "status",
              "createdAt",
            ])
            .where("reporterId", "=", userId)
            .orderBy("createdAt")
            .orderBy("id")
            .limit(limit)
            .offset(offset)
            .execute(),
        serializeReport,
      ),
      paged(
        (db, userId, { limit, offset }) =>
          db
            .selectFrom("groupReports")
            .select([
              "id",
              sql<"GROUP">`'GROUP'`.as("kind"),
              "groupId",
              "reason",
              "details",
              "status",
              "createdAt",
            ])
            .where("reporterId", "=", userId)
            .orderBy("createdAt")
            .orderBy("id")
            .limit(limit)
            .offset(offset)
            .execute(),
        serializeReport,
      ),
      paged(
        (db, userId, { limit, offset }) =>
          db
            .selectFrom("userReports as r")
            .innerJoin("users as u", "u.id", "r.userId")
            .select([
              "r.id",
              sql<"USER">`'USER'`.as("kind"),
              "r.userId as reportedUserId",
              "u.username as reportedUsername",
              "r.reason",
              "r.details",
              "r.status",
              "r.createdAt",
            ])
            .where("r.reporterId", "=", userId)
            .orderBy("r.createdAt")
            .orderBy("r.id")
            .limit(limit)
            .offset(offset)
            .execute(),
        serializeReport,
      ),
    ),
  },
  {
    name: "requests.json",
    description:
      "The edits you suggested to titles, and the groups you asked to create or to take over.",
    rows: concat(
      paged(
        (db, userId, { limit, offset }) =>
          db
            .selectFrom("mediaSuggestions")
            .select([
              "id",
              "mediaId",
              "status",
              sql<Json>`"changes"`.as("changes"),
              "note",
              "acceptedFields",
              "reviewedAt",
              "createdAt",
              "updatedAt",
            ])
            .where("authorId", "=", userId)
            .orderBy("createdAt")
            .orderBy("id")
            .limit(limit)
            .offset(offset)
            .execute(),
        serializeMediaSuggestion,
      ),
      paged(
        (db, userId, { limit, offset }) =>
          db
            .selectFrom("groupCreationRequests")
            .select([
              "id",
              "name",
              "description",
              "proofLinks",
              "message",
              "status",
              "groupId",
              "createdAt",
              "updatedAt",
            ])
            .where("userId", "=", userId)
            .orderBy("createdAt")
            .orderBy("id")
            .limit(limit)
            .offset(offset)
            .execute(),
        serializeGroupCreationRequest,
      ),
      paged(
        (db, userId, { limit, offset }) =>
          db
            .selectFrom("groupOwnershipRequests as r")
            .innerJoin("groups as g", "g.id", "r.groupId")
            .select([
              "r.id",
              "r.groupId",
              "g.name as groupName",
              "r.message",
              "r.proofLinks",
              "r.status",
              "r.createdAt",
              "r.updatedAt",
            ])
            .where("r.userId", "=", userId)
            .orderBy("r.createdAt")
            .orderBy("r.id")
            .limit(limit)
            .offset(offset)
            .execute(),
        serializeGroupOwnershipRequest,
      ),
    ),
  },
  {
    name: "uploaded-chapters.json",
    description:
      "The chapters you uploaded. Their pages are not in this archive: they are published content, not data about you.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("chapters as c")
          .select([
            "c.id",
            "c.mediaId",
            "c.number",
            "c.volume",
            "c.title",
            "c.language",
            "c.status",
            "c.createdAt",
            "c.deletedAt",
            mainTitle("c.mediaId").as("mediaTitle"),
          ])
          .where("c.uploaderId", "=", userId)
          .orderBy("c.createdAt")
          .orderBy("c.id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeUploadedChapter,
    ),
  },
  {
    name: "mangadex-imports.json",
    description: "The chapter imports from MangaDex you started, and what each one brought in.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("mangaDexSyncs")
          .select([
            "id",
            "mediaId",
            "mangaDexId",
            "status",
            sql<Json>`"summary"`.as("summary"),
            "createdAt",
            "finishedAt",
          ])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeMangaDexSync,
    ),
  },
  {
    name: "notifications.json",
    description: "The notifications in your inbox.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("notifications")
          .select([
            "id",
            "type",
            "chapterId",
            "commentId",
            "achievement",
            sql<Json | null>`"payload"`.as("payload"),
            "createdAt",
            "lastEventAt",
            "readAt",
          ])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeNotification,
    ),
  },
  {
    name: "achievements.json",
    description: "The achievements you earned.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("userAchievements")
          .select(["key", "count", "firstEarnedAt", "lastEarnedAt"])
          .where("userId", "=", userId)
          .orderBy("firstEarnedAt")
          .orderBy("key")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeAchievement,
    ),
  },
  {
    name: "reading-rewards.json",
    description: "The chapters that earned you reading credit and points.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("readingRewards")
          .select(["chapterId", "mediaId", "number", "pages", "points", "createdAt"])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeReadingReward,
    ),
  },
  {
    name: "ranking-results.json",
    description: "Your final ranks in the closed weeks and months of the readers ranking.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("rankingResults as r")
          .innerJoin("rankingPeriods as p", "p.id", "r.periodId")
          .select([
            "p.kind",
            "p.startsAt",
            "p.endsAt",
            "r.rank",
            "r.chapters",
            "r.pages",
            "r.points",
          ])
          .where("r.userId", "=", userId)
          .orderBy("p.startsAt")
          .orderBy("r.id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeRankingResult,
    ),
  },
  {
    name: "cosmetics.json",
    description: "The cosmetics you own. The ones you wear are in profile.json.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("userCosmetics")
          .select(["kind", "key", "acquiredAt"])
          .where("userId", "=", userId)
          .orderBy("acquiredAt")
          .orderBy("kind")
          .orderBy("key")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeCosmetic,
    ),
  },
  {
    name: "shop-purchases.json",
    description: "What you bought in the shop, and the loot boxes you opened.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("shopPurchases")
          .select([
            "id",
            "type",
            "lootBox",
            "cosmeticKind",
            "cosmeticKey",
            "price",
            "refund",
            "duplicate",
            "createdAt",
          ])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeShopPurchase,
    ),
  },
  {
    name: "sessions.json",
    description:
      "The devices signed in to your account: their IP address, browser and dates. The sign-in tokens themselves are left out.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("sessions")
          .select([
            "ipAddress",
            "userAgent",
            "impersonatedBy",
            "createdAt",
            "updatedAt",
            "expiresAt",
          ])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializeSession,
    ),
  },
  {
    name: "push-devices.json",
    description:
      "The browsers that receive your push notifications. Their delivery addresses and keys are left out.",
    rows: paged(
      (db, userId, { limit, offset }) =>
        db
          .selectFrom("pushSubscriptions")
          .select(["userAgent", "locale", "createdAt", "updatedAt"])
          .where("userId", "=", userId)
          .orderBy("createdAt")
          .orderBy("id")
          .limit(limit)
          .offset(offset)
          .execute(),
      serializePushDevice,
    ),
  },
]
