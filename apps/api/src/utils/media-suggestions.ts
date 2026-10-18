import { config } from "@taiyomoe/config"
import {
  type DB,
  type Kysely,
  MEDIA_SUGGESTION_STATUSES,
  type MediaEdit,
  type MediaEditField,
} from "@taiyomoe/db"
import z from "zod"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"
import {
  conflictingFields,
  editedFields,
  mediaEditFieldSchema,
  mediaEditSchema,
  mediaEditViewSchema,
  pickFields,
  readMediaEdits,
  withStaffNames,
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
  changes: mediaEditSchema,
  note: suggestionNoteSchema,
})

export const mediaSuggestionSchema = z.object({
  id: z.uuid(),
  status: z.enum(MEDIA_SUGGESTION_STATUSES),
  note: z.string().nullable().meta({ description: "The author's note for the reviewers." }),
  fields: mediaEditFieldSchema.array().meta({ description: "The fields the suggestion changes." }),
  conflicts: mediaEditFieldSchema.array().meta({
    description:
      "Fields that changed on the media since the suggestion was made. Only set while it is pending.",
  }),
  acceptedFields: mediaEditFieldSchema
    .array()
    .meta({ description: "The fields a reviewer accepted." }),
  reviewerNote: z.string().nullable(),
  reviewedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  media: z.object({
    id: z.uuid(),
    title: z.string().nullable(),
    coverUrl: z.string().nullable(),
  }),
  author: userSummarySchema,
})

export const mediaSuggestionDetailSchema = mediaSuggestionSchema.extend({
  changes: mediaEditViewSchema.meta({ description: "The suggested values." }),
  base: mediaEditViewSchema.meta({ description: "The values when the suggestion was made." }),
  current: mediaEditViewSchema.meta({ description: "The values on the media right now." }),
  reviewer: userSummarySchema.nullable(),
})

export const selectSuggestions = (db: Kysely<DB>) =>
  db
    .selectFrom("mediaSuggestions")
    .innerJoin("medias", "medias.id", "mediaSuggestions.mediaId")
    .innerJoin("users as authors", "authors.id", "mediaSuggestions.authorId")
    .leftJoin("users as reviewers", "reviewers.id", "mediaSuggestions.reviewerId")
    .where("medias.deletedAt", "is", null)

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
    "reviewers.id as reviewerId",
    "reviewers.username as reviewerUsername",
    "reviewers.displayUsername as reviewerDisplayUsername",
    "reviewers.image as reviewerImage",
  ])

type SuggestionRow = Awaited<ReturnType<ReturnType<typeof selectSuggestionColumns>["execute"]>>

const summarize = (
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
  },
})
const conflictsOf = (row: SuggestionRow[number], current: MediaEdit | undefined) =>
  row.status === "PENDING" && current !== undefined ? conflictingFields(row.base, current) : []
const loadContext = async (db: Kysely<DB>, rows: SuggestionRow, mediaIdsToRead: string[]) => {
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

export const toSuggestionDetail = async (db: Kysely<DB>, row: SuggestionRow[number]) => {
  const { current, titles, covers } = await loadContext(db, [row], [row.mediaId])
  const now = current.get(row.mediaId)
  const [changes, base, currentValues] = await withStaffNames(db, [
    row.changes,
    row.base,
    now === undefined ? {} : pickFields(now, editedFields(row.changes)),
  ])

  return {
    ...summarize(row, conflictsOf(row, now), titles, covers),
    changes: changes ?? {},
    base: base ?? {},
    current: currentValues ?? {},
    reviewer:
      row.reviewerId === null ||
      row.reviewerUsername === null ||
      row.reviewerDisplayUsername === null
        ? null
        : {
            id: row.reviewerId,
            username: row.reviewerUsername,
            displayUsername: row.reviewerDisplayUsername,
            image: row.reviewerImage,
          },
  }
}
