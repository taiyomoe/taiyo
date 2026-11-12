import { config } from "@taiyomoe/config"
import {
  type ContentRating,
  type DB,
  type Kysely,
  type SqlBool,
  sql,
  USER_LIST_VISIBILITIES,
} from "@taiyomoe/db"
import { group } from "radashi"
import z from "zod"
import { getMainCoverUrls } from "./latest-chapters"

const listOwnerSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayUsername: z.string(),
  image: z.string().nullable(),
  nameEffect: z.string().nullable().meta({ description: "The owner's equipped name effect." }),
  avatarBorder: z.string().nullable().meta({ description: "The owner's equipped avatar border." }),
})

export const listSummarySchema = z.object({
  id: z.uuid(),
  name: z.string().meta({ description: "Name of the list.", example: "Best shounen" }),
  description: z.string().nullable(),
  visibility: z.enum(USER_LIST_VISIBILITIES),
  itemCount: z.int().meta({ description: "How many titles the list holds." }),
  upvoteCount: z.int(),
  viewerVoted: z.boolean().meta({ description: "Whether you upvoted the list." }),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  owner: listOwnerSchema,
  coverUrls: z
    .url()
    .array()
    .meta({
      description: `Main covers of the first titles (up to ${config.lists.previewCovers}) that match the requested content ratings.`,
    }),
})

export const utcTimestampSql = (column: string) =>
  sql<string>`to_char(${sql.ref(column)}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`

export const liveListMediaSql = sql<boolean>`exists (select 1 from "medias" where "medias"."id" = "userListItems"."mediaId" and "medias"."deletedAt" is null)`

export const countListItems = (db: Kysely<DB>, listId: string) =>
  db
    .selectFrom("userListItems")
    .where("listId", "=", listId)
    .where(liveListMediaSql)
    .select(db.fn.countAll<string>().as("count"))
    .executeTakeFirstOrThrow()
    .then((row) => Number(row.count))

export const touchList = (db: Kysely<DB>, listId: string) =>
  db
    .updateTable("userLists")
    .set({ updatedAt: sql`CURRENT_TIMESTAMP` })
    .where("id", "=", listId)
    .execute()

export const selectListSummaries = (db: Kysely<DB>, viewerId: string | null) =>
  db
    .selectFrom("userLists")
    .innerJoin("users", "users.id", "userLists.userId")
    .where("userLists.deletedAt", "is", null)
    .select((eb) => [
      "userLists.id",
      "userLists.name",
      "userLists.description",
      "userLists.visibility",
      "userLists.upvoteCount",
      utcTimestampSql("userLists.createdAt").as("createdAt"),
      utcTimestampSql("userLists.updatedAt").as("updatedAt"),
      "users.id as ownerId",
      "users.username as ownerUsername",
      "users.displayUsername as ownerDisplayUsername",
      "users.image as ownerImage",
      "users.nameEffect as ownerNameEffect",
      "users.avatarBorder as ownerAvatarBorder",
      eb
        .selectFrom("userListItems")
        .whereRef("userListItems.listId", "=", "userLists.id")
        .where(liveListMediaSql)
        .select(eb.fn.countAll<string>().as("count"))
        .as("itemCount"),
      viewerId === null
        ? sql<boolean>`false`.as("viewerVoted")
        : eb
            .exists(
              eb
                .selectFrom("userListVotes")
                .select("userListVotes.listId")
                .whereRef("userListVotes.listId", "=", "userLists.id")
                .where("userListVotes.userId", "=", viewerId),
            )
            .as("viewerVoted"),
    ])

type ListSummaryRow = {
  id: string
  itemCount: string | number | bigint | null
  viewerVoted: SqlBool
  ownerId: string
  ownerUsername: string
  ownerDisplayUsername: string
  ownerImage: string | null
  ownerNameEffect: string | null
  ownerAvatarBorder: string | null
}

export const toListSummaries = async <T extends ListSummaryRow>(
  db: Kysely<DB>,
  rows: T[],
  contentRatings: readonly ContentRating[],
) => {
  const previews =
    rows.length === 0
      ? []
      : await db
          .selectFrom((eb) =>
            eb
              .selectFrom("userListItems")
              .innerJoin("medias", "medias.id", "userListItems.mediaId")
              .where(
                "userListItems.listId",
                "in",
                rows.map((row) => row.id),
              )
              .where("medias.deletedAt", "is", null)
              .where("medias.contentRating", "in", contentRatings)
              .select([
                "userListItems.listId",
                "userListItems.mediaId",
                sql<number>`row_number() over (partition by "userListItems"."listId" order by "userListItems"."position", "userListItems"."addedAt")`.as(
                  "rank",
                ),
              ])
              .as("ranked"),
          )
          .where("rank", "<=", config.lists.previewCovers)
          .select(["listId", "mediaId", "rank"])
          .orderBy("rank", "asc")
          .execute()
  const coverUrls = await getMainCoverUrls(db, [...new Set(previews.map((row) => row.mediaId))])
  const previewsByList = group(previews, (row) => row.listId)

  return rows.map(
    ({
      ownerId,
      ownerUsername,
      ownerDisplayUsername,
      ownerImage,
      ownerNameEffect,
      ownerAvatarBorder,
      itemCount,
      viewerVoted,
      ...row
    }) => ({
      ...row,
      itemCount: Number(itemCount ?? 0),
      viewerVoted: viewerVoted === true || viewerVoted === 1,
      owner: {
        id: ownerId,
        username: ownerUsername,
        displayUsername: ownerDisplayUsername,
        image: ownerImage,
        nameEffect: ownerNameEffect,
        avatarBorder: ownerAvatarBorder,
      },
      coverUrls: (previewsByList[row.id] ?? []).flatMap((preview) => {
        const url = coverUrls.get(preview.mediaId)

        return url === undefined ? [] : [url]
      }),
    }),
  )
}

export const findMissingMediaIds = async (db: Kysely<DB>, mediaIds: readonly string[]) => {
  if (mediaIds.length === 0) {
    return []
  }

  const found = await db
    .selectFrom("medias")
    .select("id")
    .where("id", "in", mediaIds)
    .where("deletedAt", "is", null)
    .execute()
  const existing = new Set(found.map((row) => row.id))

  return mediaIds.filter((id) => !existing.has(id))
}

export const replaceListItems = async (
  db: Kysely<DB>,
  listId: string,
  mediaIds: readonly string[],
) => {
  await db
    .deleteFrom("userListItems")
    .where("listId", "=", listId)
    .where((eb) => (mediaIds.length === 0 ? eb.and([]) : eb("mediaId", "not in", mediaIds)))
    .execute()

  if (mediaIds.length > 0) {
    await db
      .insertInto("userListItems")
      .values(mediaIds.map((mediaId, position) => ({ listId, mediaId, position })))
      .onConflict((oc) =>
        oc
          .columns(["listId", "mediaId"])
          .doUpdateSet((eb) => ({ position: eb.ref("excluded.position") })),
      )
      .execute()
  }
}

export const listMediaIdsSchema = z
  .uuid()
  .array()
  .max(config.lists.maxItems)
  .refine((ids) => new Set(ids).size === ids.length, { message: "Titles must be unique." })
  .meta({
    description: `Ordered IDs of the titles on the list, at most ${config.lists.maxItems}.`,
  })
