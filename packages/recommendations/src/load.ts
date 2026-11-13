import { type DB, type Kysely, sql, type UserLibraryStatus } from "@taiyomoe/db"
import { group } from "radashi"
import type { EngineInput, EngineInteraction } from "./engine"

export const LIBRARY_WEIGHTS: Record<UserLibraryStatus, number> = {
  COMPLETED: 1,
  REREADING: 1,
  READING: 0.8,
  ON_HOLD: 0.5,
  PLAN_TO_READ: 0.3,
  DROPPED: 0,
}

export const LIST_WEIGHT = 1

export const historyWeight = (chapters: number) => {
  if (chapters >= 5) {
    return 0.9
  }

  return chapters >= 2 ? 0.6 : 0.3
}

const loadInteractions = async (db: Kysely<DB>) => {
  const activeUsers = db
    .selectFrom("users")
    .select("users.id")
    .where((eb) => eb.or([eb("users.banned", "is", null), eb("users.banned", "=", false)]))
  const [library, lists, history] = await Promise.all([
    db
      .selectFrom("userLibraryEntries")
      .select(["userId", "mediaId", "status"])
      .where("userId", "in", activeUsers)
      .execute(),
    db
      .selectFrom("userListItems")
      .innerJoin("userLists", "userLists.id", "userListItems.listId")
      .select(["userLists.userId", "userListItems.mediaId"])
      .where("userLists.deletedAt", "is", null)
      .where("userLists.userId", "in", activeUsers)
      .execute(),
    db
      .selectFrom("userHistories")
      .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
      .select([
        "userHistories.userId",
        "chapters.mediaId",
        sql<string>`count(distinct ${sql.ref("chapters.number")})`.as("chapters"),
      ])
      .where("chapters.deletedAt", "is", null)
      .where("userHistories.userId", "in", activeUsers)
      .groupBy(["userHistories.userId", "chapters.mediaId"])
      .execute(),
  ])

  return [
    ...library.map((entry) => ({
      userId: entry.userId,
      mediaId: entry.mediaId,
      weight: LIBRARY_WEIGHTS[entry.status],
    })),
    ...lists.map((item) => ({ userId: item.userId, mediaId: item.mediaId, weight: LIST_WEIGHT })),
    ...history.map((row) => ({
      userId: row.userId,
      mediaId: row.mediaId,
      weight: historyWeight(Number(row.chapters)),
    })),
  ] satisfies EngineInteraction[]
}

export const loadEngineInput = async (db: Kysely<DB>) => {
  const [medias, staffs, relations, interactions] = await Promise.all([
    db
      .selectFrom("medias")
      .select(["id", "tags", "type", "demography", "countryOfOrigin", "contentRating"])
      .where("deletedAt", "is", null)
      .execute(),
    db
      .selectFrom("mediaStaffs")
      .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
      .select(["mediaStaffs.mediaId", "mediaStaffs.staffId"])
      .where("staffs.deletedAt", "is", null)
      .execute(),
    db.selectFrom("mediaRelations").select(["mediaId", "relatedMediaId"]).execute(),
    loadInteractions(db),
  ])
  const staffsByMedia = group(staffs, (staff) => staff.mediaId)

  return {
    medias: medias.map((media) => ({
      ...media,
      tags: media.tags ?? [],
      staffIds: (staffsByMedia[media.id] ?? []).map((staff) => staff.staffId),
    })),
    interactions,
    relations: relations.map((relation) => [relation.mediaId, relation.relatedMediaId] as const),
  } satisfies EngineInput
}
