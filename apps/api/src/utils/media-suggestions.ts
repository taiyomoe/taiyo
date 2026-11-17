import { config } from "@taiyomoe/config"
import {
  type DB,
  type Kysely,
  MEDIA_SUGGESTION_STATUSES,
  type MediaEdit,
  type MediaEditField,
  sql,
} from "@taiyomoe/db"
import z from "zod"
import { bulkIdsSchema } from "./bulk"
import { escapeLike } from "./escape-like"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"
import {
  applyMediaEdit,
  checkMediaEdit,
  diffMediaEdit,
  editedFields,
  lockMedia,
  mediaEditFieldSchema,
  mediaEditSchema,
  mediaEditViewSchema,
  normalizeMediaEdit,
  readMediaEdit,
  readMediaEdits,
  sameValue,
} from "./media-edit"
import { userSummarySchema } from "./schemas"

export const suggestionNoteSchema = z
  .string()
  .trim()
  .max(config.input.maxReviewNoteLength)
  .transform((note) => (note === "" ? null : note))
  .nullable()
  .exactOptional()
  .meta({ description: "Where the information comes from, for the reviewers." })

export const mediaSuggestionBodySchema = z.object({
  changes: mediaEditSchema.meta({
    description: "The suggested changes. Only the fields that differ from the media are kept.",
  }),
  note: suggestionNoteSchema,
})

export const mediaSuggestionSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the suggestion." }),
  status: z
    .enum(MEDIA_SUGGESTION_STATUSES)
    .meta({ description: "The review status of the suggestion.", example: "PENDING" }),
  note: z.string().nullable().meta({
    description: "The note of the author for the reviewers, if any.",
    example: "The official site lists the series as finished.",
  }),
  fields: mediaEditFieldSchema.array().meta({ description: "The fields the suggestion changes." }),
  conflicts: mediaEditFieldSchema.array().meta({
    description:
      "The fields that changed on the media since the suggestion was made. Always empty once the suggestion is no longer pending.",
  }),
  acceptedFields: mediaEditFieldSchema
    .array()
    .meta({ description: "The fields a reviewer accepted." }),
  reviewerNote: z.string().nullable().meta({
    description: "The note of the reviewer for the author, if any.",
    example: "No source for the end date.",
  }),
  reviewedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the suggestion was reviewed, if it was." }),
  createdAt: z.iso.datetime().meta({ description: "When the suggestion was made." }),
  updatedAt: z.iso.datetime().meta({ description: "When the suggestion was last updated." }),
  media: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z
        .string()
        .nullable()
        .meta({ description: "The main title of the media, if any.", example: "One Punch Man" }),
      coverUrl: z
        .string()
        .nullable()
        .meta({ description: "The URL of the main cover of the media, if any." }),
    })
    .meta({ description: "The media the suggestion is for." }),
  author: userSummarySchema.meta({ description: "The author of the suggestion." }),
})

export const mediaSuggestionDetailSchema = mediaSuggestionSchema.extend({
  changes: mediaEditViewSchema.meta({ description: "The suggested values." }),
  base: mediaEditViewSchema.meta({ description: "The values when the suggestion was made." }),
  current: mediaEditViewSchema.meta({
    description: "The values on the media right now, for the fields the suggestion changes.",
  }),
  reviewer: userSummarySchema
    .nullable()
    .meta({ description: "The reviewer of the suggestion, if any." }),
})

export const selectSuggestions = (db: Kysely<DB>) =>
  db
    .selectFrom("mediaSuggestions")
    .innerJoin("medias", "medias.id", "mediaSuggestions.mediaId")
    .innerJoin("users as authors", "authors.id", "mediaSuggestions.authorId")
    .leftJoin("users as reviewers", "reviewers.id", "mediaSuggestions.reviewerId")
    .where("medias.deletedAt", "is", null)

/** Keeps the suggestions on a media with a matching title, or by a matching author. */
export const searchSuggestions = (
  query: ReturnType<typeof selectSuggestions>,
  search: string | undefined,
  { byAuthor }: { byAuthor: boolean },
) => {
  if (search === undefined) {
    return query
  }

  const pattern = `%${escapeLike(search)}%`

  return query.where((eb) =>
    eb.or([
      eb.exists(
        eb
          .selectFrom("titles")
          .select("titles.mediaId")
          .whereRef("titles.mediaId", "=", "mediaSuggestions.mediaId")
          .where("titles.deletedAt", "is", null)
          .where("titles.title", "ilike", pattern),
      ),
      ...(byAuthor
        ? [
            eb("authors.username", "ilike", pattern),
            eb("authors.displayUsername", "ilike", pattern),
          ]
        : []),
    ]),
  )
}

export const selectSuggestionColumns = (query: ReturnType<typeof selectSuggestions>) =>
  query.select([
    "mediaSuggestions.id",
    "mediaSuggestions.mediaId",
    "mediaSuggestions.status",
    "mediaSuggestions.note",
    "mediaSuggestions.changes",
    "mediaSuggestions.base",
    "mediaSuggestions.acceptedFields",
    "mediaSuggestions.reviewerNote",
    "mediaSuggestions.reviewedAt",
    "mediaSuggestions.createdAt",
    "mediaSuggestions.updatedAt",
    "authors.id as authorId",
    "authors.username as authorUsername",
    "authors.displayUsername as authorDisplayUsername",
    "authors.image as authorImage",
    "authors.nameEffect as authorNameEffect",
    "authors.avatarBorder as authorAvatarBorder",
    "reviewers.id as reviewerId",
    "reviewers.username as reviewerUsername",
    "reviewers.displayUsername as reviewerDisplayUsername",
    "reviewers.image as reviewerImage",
    "reviewers.nameEffect as reviewerNameEffect",
    "reviewers.avatarBorder as reviewerAvatarBorder",
  ])

type SuggestionRow = Awaited<ReturnType<ReturnType<typeof selectSuggestionColumns>["execute"]>>

export const summarize = (
  row: SuggestionRow[number],
  conflicts: MediaEditField[],
  titles: Map<string, string>,
  covers: Map<string, string>,
) => ({
  id: row.id,
  status: row.status,
  note: row.note,
  fields: editedFields(row.changes),
  conflicts,
  acceptedFields: row.acceptedFields,
  reviewerNote: row.reviewerNote,
  reviewedAt: row.reviewedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  media: {
    id: row.mediaId,
    title: titles.get(row.mediaId) ?? null,
    coverUrl: covers.get(row.mediaId) ?? null,
  },
  author: {
    id: row.authorId,
    username: row.authorUsername,
    displayUsername: row.authorDisplayUsername,
    image: row.authorImage,
    nameEffect: row.authorNameEffect,
    avatarBorder: row.authorAvatarBorder,
  },
})

export const conflictsOf = (row: SuggestionRow[number], current: MediaEdit | undefined) =>
  row.status === "PENDING" && current !== undefined
    ? editedFields(row.base).filter((field) => !sameValue(row.base[field], current[field]))
    : []

export const loadContext = async (
  db: Kysely<DB>,
  rows: SuggestionRow,
  mediaIdsToRead: string[],
) => {
  const mediaIds = [...new Set(rows.map((row) => row.mediaId))]
  const [current, titles, covers] = await Promise.all([
    readMediaEdits(db, [...new Set(mediaIdsToRead)]),
    getMainTitles(db, mediaIds),
    getMainCoverUrls(db, mediaIds),
  ])

  return { current, titles, covers }
}

export const toSuggestionSummaries = async (db: Kysely<DB>, rows: SuggestionRow) => {
  const { current, titles, covers } = await loadContext(
    db,
    rows,
    rows.filter((row) => row.status === "PENDING").map((row) => row.mediaId),
  )

  return rows.map((row) =>
    summarize(row, conflictsOf(row, current.get(row.mediaId)), titles, covers),
  )
}

export const suggestionIdsSchema = bulkIdsSchema("suggestions", [
  "4c2e8a1f-6b3d-4f9e-a7c5-1d8b2e6f9a3c",
  "9e7d1b5a-2c4f-4a8e-b6d3-7f1c9a2e5b8d",
])

/** Locks the suggestions on live medias, oldest first, for a review or a withdrawal. */
export const lockSuggestions = (db: Kysely<DB>, ids: readonly string[]) =>
  db
    .selectFrom("mediaSuggestions")
    .select(["id", "mediaId", "authorId", "status", "changes", "base"])
    .where("id", "in", ids)
    .where("mediaId", "in", db.selectFrom("medias").select("id").where("deletedAt", "is", null))
    .orderBy("createdAt")
    .orderBy("id")
    .forUpdate()
    .execute()

export const rejectSuggestions = async (
  db: Kysely<DB>,
  ids: readonly string[],
  { reviewerId, note }: { reviewerId: string; note: string },
) => {
  if (ids.length > 0) {
    await db
      .updateTable("mediaSuggestions")
      .set({
        status: "REJECTED",
        reviewerId,
        reviewerNote: note,
        reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
      })
      .where("id", "in", ids)
      .execute()
  }
}

export const withdrawSuggestions = async (db: Kysely<DB>, ids: readonly string[]) => {
  if (ids.length > 0) {
    await db
      .updateTable("mediaSuggestions")
      .set({ status: "WITHDRAWN" })
      .where("id", "in", ids)
      .execute()
  }
}

/**
 * Applies the accepted fields of a locked pending suggestion to its media, credited to the
 * author, and marks the suggestion accepted. Nothing is written when the edit cannot apply.
 */
export const acceptSuggestion = async (
  db: Kysely<DB>,
  {
    suggestion,
    changes,
    reviewerId,
    note,
  }: {
    suggestion: { id: string; mediaId: string; authorId: string }
    changes: MediaEdit
    reviewerId: string
    note: string | null
  },
) => {
  if ((await lockMedia(db, suggestion.mediaId)) === undefined) {
    return { error: { code: "MEDIA_NOT_FOUND" as const } }
  }

  const current = await readMediaEdit(db, suggestion.mediaId)
  const edit = diffMediaEdit(current, normalizeMediaEdit(changes))
  const error = await checkMediaEdit(db, suggestion.mediaId, edit)

  if (error !== null) {
    return { error }
  }

  await applyMediaEdit(db, { mediaId: suggestion.mediaId, actorId: suggestion.authorId, edit })
  await db
    .updateTable("mediaSuggestions")
    .set({
      status: "ACCEPTED",
      acceptedFields: editedFields(changes),
      reviewerId,
      reviewerNote: note,
      reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
    })
    .where("id", "=", suggestion.id)
    .execute()

  return { error: null, current, edit }
}
