import {
  CONTENT_RATINGS,
  MANGADEX_SYNC_ITEM_KINDS,
  MANGADEX_SYNC_ITEM_STATUSES,
  MANGADEX_SYNC_STATUSES,
  MEDIA_DEMOGRAPHIES,
  MEDIA_LINK_KEYS,
  MEDIA_STATUSES,
  STAFF_ROLES,
} from "@taiyomoe/db"
import z from "zod"
import { languageSchema, mediaLanguageSchema } from "./schemas"

const keySchema = z.string().meta({
  description: "The key to pass in `keys` to import this item.",
  example: "chapter:6e04e431-fc6b-4e38-b952-6232c72df112",
})
const selectedSchema = z.boolean().meta({ description: "Whether the item is picked by default." })
const fieldValueSchema = z
  .union([z.enum(MEDIA_STATUSES), z.enum(MEDIA_DEMOGRAPHIES), z.enum(CONTENT_RATINGS), z.string()])
  .nullable()

export const mangaDexPlanSchema = z.object({
  mangaDex: z.object({
    id: z.uuid().meta({ description: "The ID of the MangaDex entry." }),
    title: z.string().meta({ description: "The title of the MangaDex entry." }),
  }),
  titles: z
    .object({
      key: keySchema,
      title: z.string().meta({ description: "The title." }),
      language: mediaLanguageSchema("The language of the title."),
      selected: selectedSchema,
    })
    .array()
    .meta({ description: "Titles the media does not have yet." }),
  synopses: z
    .object({
      key: keySchema,
      language: languageSchema("The language of the synopsis."),
      text: z.string().meta({ description: "The synopsis, in Markdown." }),
      selected: selectedSchema,
    })
    .array()
    .meta({ description: "Synopses in languages the media has none in." }),
  staff: z
    .object({
      key: keySchema,
      mangaDexId: z.uuid().meta({ description: "The ID of the author or artist on MangaDex." }),
      name: z.string().meta({ description: "The name of the staff." }),
      role: z.enum(STAFF_ROLES).meta({ description: "The role of the staff on the media." }),
      staffId: z
        .uuid()
        .nullable()
        .meta({ description: "The Taiyō staff of the same name, or `null` to create one." }),
      selected: selectedSchema,
    })
    .array()
    .meta({ description: "Authors and artists the media does not credit yet." }),
  tags: z
    .object({
      key: keySchema,
      tag: z.string().meta({ description: "The key of the Taiyō tag.", example: "ACTION" }),
      name: z.string().meta({ description: "The name of the tag on MangaDex." }),
      selected: selectedSchema,
    })
    .array()
    .meta({ description: "Tags the media does not have yet." }),
  unmatchedTags: z
    .string()
    .array()
    .meta({ description: "MangaDex tags with no Taiyō equivalent, which are never imported." }),
  links: z
    .object({
      key: keySchema,
      link: z.enum(MEDIA_LINK_KEYS).meta({ description: "The kind of link." }),
      value: z.union([z.string(), z.number()]).meta({ description: "The URL or ID." }),
      selected: selectedSchema,
    })
    .array()
    .meta({ description: "Links the media does not have yet." }),
  fields: z
    .object({
      key: keySchema,
      field: z.enum(["status", "demography", "contentRating", "startDate"]).meta({
        description: "The field of the media.",
      }),
      current: fieldValueSchema.meta({ description: "The value on Taiyō." }),
      proposed: fieldValueSchema.meta({ description: "The value on MangaDex." }),
      selected: selectedSchema,
    })
    .array()
    .meta({ description: "Fields whose MangaDex value differs, or that Taiyō leaves empty." }),
  covers: z
    .object({
      key: keySchema,
      mangaDexId: z.uuid().meta({ description: "The ID of the cover on MangaDex." }),
      volume: z.string().nullable().meta({ description: "The volume of the cover, if any." }),
      language: mediaLanguageSchema("The language of the cover."),
      fileName: z.string().meta({
        description:
          "The file name of the cover on MangaDex, to preview it through `GET /mangadex-syncs/covers/{mangaDexId}/{fileName}`.",
      }),
      selected: selectedSchema,
    })
    .array()
    .meta({ description: "Covers of a volume and language the media has none for." }),
  chapters: z
    .object({
      key: keySchema,
      mangaDexId: z.uuid().meta({ description: "The ID of the chapter on MangaDex." }),
      number: z.number().meta({ description: "The number of the chapter, 0 for a oneshot." }),
      volume: z.string().nullable().meta({ description: "The volume of the chapter, if any." }),
      title: z.string().nullable().meta({ description: "The title of the chapter, if any." }),
      language: languageSchema("The language of the chapter."),
      pages: z.int().meta({ description: "The number of pages." }),
      isExternal: z
        .boolean()
        .meta({ description: "Whether the chapter is only hosted on the publisher's site." }),
      publishedAt: z.iso.datetime().meta({ description: "When MangaDex released the chapter." }),
      groups: z
        .object({
          name: z.string().meta({ description: "The name of the group." }),
          exists: z.boolean().meta({
            description: "Whether a Taiyō group has this name; otherwise one is created.",
          }),
        })
        .array()
        .meta({ description: "The groups credited on MangaDex." }),
      selected: selectedSchema,
    })
    .array()
    .meta({
      description:
        "Chapters in English, French, Brazilian or European Portuguese that the media is missing.",
    }),
  skippedChapters: z.int().meta({
    description:
      "MangaDex chapters that cannot be imported: unavailable, not numbered, not released yet, without pages, or a repeat of another MangaDex chapter of the same release.",
  }),
})

const counts = z.object({
  pending: z.int().meta({ description: "Items still waiting." }),
  done: z.int().meta({ description: "Items imported." }),
  skipped: z.int().meta({ description: "Items skipped." }),
  failed: z.int().meta({ description: "Items that failed." }),
})

export const mangaDexSyncSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the sync." }),
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
  status: z.enum(MANGADEX_SYNC_STATUSES).meta({ description: "The status of the sync." }),
  mangaDexId: z.uuid().meta({ description: "The ID of the MangaDex entry." }),
  error: z.string().nullable().meta({ description: "Why the sync failed, if it did." }),
  summary: z
    .record(z.string(), z.int())
    .meta({ description: "How many titles, synopses, staff, tags, links and fields it added." }),
  counts: counts.meta({ description: "How far the covers and chapters got." }),
  user: z.object({
    id: z.uuid().meta({ description: "The ID of the user who started the sync." }),
    name: z.string().meta({ description: "The name of the user who started the sync." }),
  }),
  createdAt: z.iso.datetime().meta({ description: "When the sync started." }),
  finishedAt: z.iso.datetime().nullable().meta({ description: "When the sync ended, if it did." }),
})

export const mangaDexSyncItemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the item." }),
  kind: z.enum(MANGADEX_SYNC_ITEM_KINDS).meta({ description: "What the item imports." }),
  mangaDexId: z.uuid().meta({ description: "The ID of the cover or chapter on MangaDex." }),
  status: z.enum(MANGADEX_SYNC_ITEM_STATUSES).meta({ description: "The status of the item." }),
  error: z.string().nullable().meta({ description: "Why it was skipped or failed." }),
  entityId: z
    .uuid()
    .nullable()
    .meta({ description: "The ID of the imported cover or chapter on Taiyō." }),
  details: z
    .object({
      language: z.string().meta({ description: "The language of the cover or chapter." }),
      volume: z.string().nullable().meta({ description: "The volume, if any." }),
      number: z.number().optional().meta({ description: "The number of the chapter." }),
      title: z.string().nullable().optional().meta({ description: "The title of the chapter." }),
      groups: z.string().array().optional().meta({ description: "The groups of the chapter." }),
    })
    .meta({ description: "What the item is." }),
})
