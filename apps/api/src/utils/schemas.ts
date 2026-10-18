import { config } from "@taiyomoe/config"
import {
  CHAPTER_STATUSES,
  CONTENT_RATINGS,
  GROUP_PERMISSIONS,
  LANGUAGES,
  MEDIA_COUNTRIES_OF_ORIGIN,
} from "@taiyomoe/db"
import z from "zod"

export const apiSuccessEnvelope = <T extends z.ZodType, M extends z.ZodType = z.ZodNever>(
  data: T,
  meta?: M,
) =>
  z.object({
    success: z.literal(true),
    data,
    ...(meta ? { meta } : {}),
    timestamp: z.iso.datetime(),
    requestId: z.string(),
  })

export const apiErrorEnvelope = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
  timestamp: z.iso.datetime(),
  requestId: z.string(),
  details: z.unknown().optional(),
})

export const languageSchema = (description: string) =>
  z.enum(LANGUAGES).meta({ description, example: "en" })

export const contentRatingSchema = (description: string) =>
  z.enum(CONTENT_RATINGS).meta({ description, example: "NORMAL" })

export const contentRatingsQuerySchema = z
  .string()
  .transform((value) => value.split(","))
  .pipe(z.enum(CONTENT_RATINGS).array().min(1))
  .default([...config.settings.contentRating])
  .meta({
    description:
      "Comma-separated content ratings to include. A chapter counts as the stricter of its own rating and its media's. Defaults to the default user setting.",
    example: "NORMAL,SUGGESTIVE",
  })

export const fileSchema = (description: string) =>
  z.file().mime(["image/png", "image/jpeg", "image/gif", "image/webp"]).meta({ description })

export const mediaTagsSchema = z
  .object({
    key: z
      .enum(Object.keys(config.tags))
      .meta({ description: "The key of the tag.", example: "COWBOYS" }),
    isSpoiler: z
      .boolean()
      .default(false)
      .meta({ description: "Whether the tag is a spoiler.", example: false }),
  })
  .array()
  .meta({
    description: "List of tags that describe elements and themes of the media.",
    examples: [
      { key: "COWBOYS", isSpoiler: false },
      { key: "AWARD_WINNING", isSpoiler: false },
    ],
  })

const httpUrlSchema = z.url({ protocol: /^https?$/ }).max(config.input.maxUrlLength)

export const mediaLinksSchema = z
  .object({
    mangaDex: z.uuid().exactOptional().meta({ description: "MangaDex series UUID." }),
    anilist: z.int().positive().exactOptional().meta({ description: "AniList numeric media ID." }),
    myAnimeList: z
      .int()
      .positive()
      .exactOptional()
      .meta({ description: "MyAnimeList numeric media ID." }),
    animePlanet: httpUrlSchema.exactOptional().meta({ description: "Anime-Planet URL." }),
    bookWalker: httpUrlSchema.exactOptional().meta({ description: "BookWalker series URL." }),
    mangaUpdates: httpUrlSchema.exactOptional().meta({ description: "MangaUpdates series URL." }),
    novelUpdates: httpUrlSchema.exactOptional().meta({ description: "NovelUpdates series URL." }),
    kitsu: httpUrlSchema.exactOptional().meta({ description: "Kitsu manga URL." }),
    amazon: httpUrlSchema.exactOptional().meta({ description: "Amazon product URL." }),
    eBookJapan: httpUrlSchema.exactOptional().meta({ description: "eBookJapan product URL." }),
    raw: httpUrlSchema
      .exactOptional()
      .meta({ description: "URL to the original raw publication." }),
    officialENTranslation: httpUrlSchema
      .exactOptional()
      .meta({ description: "URL to the official English translation." }),
    officialFRTranslation: httpUrlSchema
      .exactOptional()
      .meta({ description: "URL to the official French translation." }),
    officialPTBRTranslation: httpUrlSchema
      .exactOptional()
      .meta({ description: "URL to the official Brazilian Portuguese translation." }),
    cdJapan: httpUrlSchema.exactOptional().meta({ description: "CDJapan product URL." }),
  })
  .meta({
    description: "External references for this media.",
    example: {
      mangaDex: "0ca1627e-95dd-4118-892a-f144adf02256",
      anilist: 31224,
      myAnimeList: 1224,
    },
  })

export const mediaSynopsisSchema = z
  .partialRecord(z.enum(LANGUAGES), z.string().max(config.input.maxSynopsisLength))
  .meta({
    description: "Synopsis text keyed by language code.",
    example: {
      en: "After defeating monsters in one punch, Saitama searches for a real challenge.",
    },
  })

export const localizedTextSchema = z
  .partialRecord(z.enum(LANGUAGES), z.string().max(config.input.maxDescriptionLength))
  .meta({
    description: "Localized text keyed by language code. Send empty string to clear a key.",
    example: { en: "Manga artist known for ...", ja: "..." },
  })

const linkUrlField = (description: string) =>
  z.string().max(config.input.maxUrlLength).exactOptional().meta({ description })

export const staffLinksSchema = z
  .object({
    website: linkUrlField("Personal website URL."),
    twitter: linkUrlField("Twitter / X handle URL."),
    youtube: linkUrlField("YouTube channel URL."),
    tumblr: linkUrlField("Tumblr URL."),
    discord: linkUrlField("Discord server / profile URL."),
    fanbox: linkUrlField("Pixiv Fanbox URL."),
    fantia: linkUrlField("Fantia URL."),
    pixiv: linkUrlField("Pixiv URL."),
    melonBooks: linkUrlField("Melonbooks URL."),
    namicomi: linkUrlField("NamiComi URL."),
    naver: linkUrlField("Naver blog / page URL."),
    nicoVideo: linkUrlField("NicoNico Video URL."),
    skeb: linkUrlField("Skeb URL."),
    weibo: linkUrlField("Weibo URL."),
    booth: linkUrlField("Booth URL."),
  })
  .meta({
    description:
      "Provider links for the staff. Send empty string for a provider to clear it. Omit a provider to leave it unchanged.",
    example: { twitter: "https://x.com/example", pixiv: "https://www.pixiv.net/users/123" },
  })

export const chapterFeedItemSchema = z.object({
  id: z.uuid().meta({
    description: "The ID of the chapter.",
    example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
  }),
  title: z.string().nullable().meta({
    description: "The title of the chapter, if any.",
    example: "The Boy with the Sharingan",
  }),
  number: z.number().meta({ description: "The chapter number.", example: 112 }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume of the chapter, if any.", example: "12" }),
  language: languageSchema("The language of the chapter."),
  contentRating: contentRatingSchema("The content rating of the chapter."),
  createdAt: z.iso.datetime().meta({
    description: "When the chapter was released.",
    example: "2026-09-21T14:03:11.221Z",
  }),
  mediaId: z.uuid().meta({
    description: "The ID of the media the chapter belongs to.",
    example: "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  }),
  mediaTitle: z.string().nullable().meta({
    description: "The main title of the media the chapter belongs to.",
    example: "Boruto: Naruto Next Generations",
  }),
})

export const latestChapterSchema = chapterFeedItemSchema
  .omit({ mediaId: true, mediaTitle: true })
  .extend({
    groups: z
      .object({
        id: z.uuid().meta({ description: "The ID of the group." }),
        name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
      })
      .array()
      .meta({ description: "The groups credited on the chapter." }),
    uploader: z
      .object({
        id: z.uuid().meta({ description: "The ID of the user." }),
        username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
        displayUsername: z
          .string()
          .meta({ description: "The display name of the user.", example: "Kaito" }),
        image: z.string().nullable().meta({ description: "URL of the user's avatar, if any." }),
      })
      .meta({ description: "The user who uploaded the chapter." }),
  })

export const latestChapterFeedItemSchema = latestChapterSchema.extend({
  mediaId: chapterFeedItemSchema.shape.mediaId,
  mediaTitle: chapterFeedItemSchema.shape.mediaTitle,
  mediaCoverUrl: z
    .url()
    .nullable()
    .meta({ description: "URL of the main cover of the media the chapter belongs to, if any." }),
})

export const latestMediaUpdateSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z.string().nullable().meta({ description: "The main title of the media." }),
  coverUrl: z.url().nullable().meta({ description: "URL of the media's main cover, if any." }),
  countryOfOrigin: z
    .enum(MEDIA_COUNTRIES_OF_ORIGIN)
    .meta({ description: "The country the media originates from.", example: "JAPAN" }),
  contentRating: contentRatingSchema("The content rating of the media."),
  chapterCount: z.int().meta({
    description: "How many chapters of the media match the requested content ratings.",
    example: 12,
  }),
  chapters: latestChapterSchema
    .array()
    .meta({ description: "The most recent matching chapters of the media, newest first." }),
})

export const groupPermissionsSchema = z
  .enum(GROUP_PERMISSIONS)
  .array()
  .max(GROUP_PERMISSIONS.length)
  .meta({ description: "Group permissions.", example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"] })

export const proofLinksSchema = z
  .url({ protocol: /^https?$/, normalize: true })
  .max(config.input.maxUrlLength)
  .array()
  .min(1)
  .max(5)
  .transform((links) => [...new Set(links)])
  .meta({
    description: "Public links proving the claim, such as the group's site or announcement posts.",
    example: ["https://discord.gg/akira-scans"],
  })

export const requestMessageSchema = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .meta({ description: "Who you are and why the request should be approved." })

export const reviewNoteSchema = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .meta({ description: "Explanation shown to the requester.", example: "No proof of ownership." })

export const userSummarySchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayUsername: z.string(),
  image: z.string().nullable(),
})

export const groupSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  logo: z.string().nullable(),
})

const emptyToNull = z.literal("").transform(() => null)

export const groupLinkSchema = (description: string) =>
  z.union([httpUrlSchema, emptyToNull]).nullable().optional().meta({ description })

export const groupDiscordSchema = z
  .union([httpUrlSchema, z.string().regex(/^(\/invite\/)?[A-Za-z0-9-]{2,64}$/), emptyToNull])
  .nullable()
  .optional()
  .meta({ description: "Discord invite link or code." })

export const groupEmailSchema = z
  .union([z.email().max(config.input.maxUrlLength), emptyToNull])
  .nullable()
  .optional()
  .meta({ description: "Contact email." })

export const chapterSubmissionSchema = latestChapterFeedItemSchema.extend({
  status: z.enum(CHAPTER_STATUSES).meta({ description: "Where the chapter is in review." }),
  rejectionReason: z.string().nullable().meta({ description: "Why the chapter was rejected." }),
  reviewedAt: z.iso.datetime().nullable().meta({ description: "When the chapter was reviewed." }),
  pageCount: z.int().meta({ description: "How many processed pages the chapter has." }),
})
