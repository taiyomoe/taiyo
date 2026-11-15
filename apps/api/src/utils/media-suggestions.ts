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
  editedFields,
  mediaEditFieldSchema,
  mediaEditSchema,
  mediaEditViewSchema,
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
