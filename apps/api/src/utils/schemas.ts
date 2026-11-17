import { config, tagKeys } from "@taiyomoe/config"
import {
  CHAPTER_STATUSES,
  CONTENT_RATINGS,
  GROUP_PERMISSIONS,
  LANGUAGES,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from "@taiyomoe/db"
import z from "zod"

const envelopeTimestampSchema = z.iso
  .datetime()
  .meta({ description: "When the response was sent.", example: "2026-09-21T14:03:11.221Z" })
const envelopeRequestIdSchema = z.string().meta({
  description: "The ID of the request, to quote when you report a problem.",
  example: "d4ad2782-b978-43a1-8946-1c9c6351a62c",
})

export const apiSuccessEnvelope = <T extends z.ZodType, M extends z.ZodType = z.ZodNever>(
  data: T,
  meta?: M,
) =>
  z.object({
    success: z.literal(true).meta({ description: "Whether the request succeeded." }),
    data,
    ...(meta ? { meta } : {}),
    timestamp: envelopeTimestampSchema,
    requestId: envelopeRequestIdSchema,
  })

export const apiErrorEnvelope = z.object({
  success: z.literal(false).meta({ description: "Whether the request succeeded." }),
  code: z
    .string()
    .meta({ description: "The stable code of the error.", example: "MEDIA_NOT_FOUND" }),
  message: z.string().meta({
    description: "A human-readable explanation of the error.",
    example: "The requested media was not found.",
  }),
  timestamp: envelopeTimestampSchema,
  requestId: envelopeRequestIdSchema,
  details: z.unknown().optional().meta({
    description: "More about the error, such as the failed fields of a validation error.",
  }),
})

const TIME_ZONES = new Set(["UTC", ...Intl.supportedValuesOf("timeZone")])
const canonicalTimeZone = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions().timeZone
  } catch {
    return value
  }
}

export const timeZoneSchema = z
  .string()
  .transform(canonicalTimeZone)
  .refine((value) => TIME_ZONES.has(value), "Unknown time zone.")
  .default("UTC")

export const languageSchema = (description: string) =>
  z.enum(SUPPORTED_LANGUAGES).meta({ description, example: "en" })

export const mediaLanguageSchema = (description: string) =>
  z.enum(MEDIA_LANGUAGES).meta({ description, example: "ja" })

export const storedLanguageSchema = (description: string) =>
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
    key: z.enum(tagKeys).meta({ description: "The key of the tag.", example: "COWBOYS" }),
    isSpoiler: z
      .boolean()
      .default(false)
      .meta({ description: "Whether the tag is a spoiler.", example: false }),
  })
  .array()
  .meta({
    description: "The tags describing the elements and themes of the media.",
    examples: [
      { key: "COWBOYS", isSpoiler: false },
      { key: "AWARD_WINNING", isSpoiler: false },
    ],
  })

const httpUrlSchema = z.url({ protocol: /^https?$/ }).max(config.input.maxUrlLength)

export const mediaLinksSchema = z
  .object({
    mangaDex: z.uuid().exactOptional().meta({ description: "The ID of the media on MangaDex." }),
    anilist: z
      .int()
      .positive()
      .exactOptional()
      .meta({ description: "The ID of the media on AniList." }),
    myAnimeList: z
      .int()
      .positive()
      .exactOptional()
      .meta({ description: "The ID of the media on MyAnimeList." }),
    kuroMangas: z
      .int()
      .positive()
      .exactOptional()
      .meta({ description: "The ID of the media on Kuro Mangás." }),
    animePlanet: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the media on Anime-Planet." }),
    bookWalker: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the media on BookWalker." }),
    mangaUpdates: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the media on MangaUpdates." }),
    novelUpdates: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the media on NovelUpdates." }),
    kitsu: httpUrlSchema.exactOptional().meta({ description: "The URL of the media on Kitsu." }),
    amazon: httpUrlSchema.exactOptional().meta({ description: "The URL of the media on Amazon." }),
    eBookJapan: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the media on eBookJapan." }),
    raw: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the original raw publication." }),
    officialENTranslation: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the official English translation." }),
    officialFRTranslation: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the official French translation." }),
    officialPTBRTranslation: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the official Brazilian Portuguese translation." }),
    cdJapan: httpUrlSchema
      .exactOptional()
      .meta({ description: "The URL of the media on CDJapan." }),
  })
  .meta({
    description: "The links of the media on external sites.",
    example: {
      mangaDex: "0ca1627e-95dd-4118-892a-f144adf02256",
      anilist: 31224,
      myAnimeList: 1224,
    },
  })

export const mediaSynopsisSchema = z
  .partialRecord(z.enum(SUPPORTED_LANGUAGES), z.string().max(config.input.maxSynopsisLength))
  .meta({
    description: "The synopsis of the media, keyed by language code.",
    example: {
      en: "After defeating monsters in one punch, Saitama searches for a real challenge.",
    },
  })

export const localizedTextSchema = z
  .partialRecord(z.enum(SUPPORTED_LANGUAGES), z.string().max(config.input.maxDescriptionLength))
  .meta({
    description: "Localized text keyed by language code. Send an empty string to clear a key.",
    example: { en: "Manga artist known for ...", pt_br: "..." },
  })

export const storedLocalizedTextSchema = z.partialRecord(z.enum(LANGUAGES), z.string()).meta({
  description: "Localized text keyed by language code.",
  example: { en: "Manga artist known for ...", pt_br: "..." },
})

const linkUrlField = (description: string) =>
  z.string().max(config.input.maxUrlLength).exactOptional().meta({ description })

export const staffLinksSchema = z
  .object({
    website: linkUrlField("The URL of the staff's personal website."),
    twitter: linkUrlField("The URL of the staff's X profile."),
    youtube: linkUrlField("The URL of the staff's YouTube channel."),
    tumblr: linkUrlField("The URL of the staff's Tumblr."),
    discord: linkUrlField("The URL of the staff's Discord server or profile."),
    fanbox: linkUrlField("The URL of the staff's Pixiv Fanbox."),
    fantia: linkUrlField("The URL of the staff's Fantia."),
    pixiv: linkUrlField("The URL of the staff's Pixiv profile."),
    melonBooks: linkUrlField("The URL of the staff's Melonbooks page."),
    namicomi: linkUrlField("The URL of the staff's NamiComi page."),
    naver: linkUrlField("The URL of the staff's Naver blog or page."),
    nicoVideo: linkUrlField("The URL of the staff's Niconico Video channel."),
    skeb: linkUrlField("The URL of the staff's Skeb page."),
    weibo: linkUrlField("The URL of the staff's Weibo profile."),
    booth: linkUrlField("The URL of the staff's Booth shop."),
  })
  .meta({
    description:
      "The links of the staff, keyed by provider. Send an empty string for a provider to clear it, and omit a provider to leave it unchanged.",
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
  language: storedLanguageSchema("The language of the chapter."),
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
  externalUrl: z.string().nullable().meta({
    description: "Link to the chapter on the group's own site, if any.",
    example: "https://sunray-scans.com/boruto/112",
  }),
  isExternal: z.boolean().meta({
    description: "Whether the chapter is only hosted on the group's site, at `externalUrl`.",
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
        nameEffect: z
          .string()
          .nullable()
          .meta({ description: "The name effect the user has equipped, if any.", example: "gold" }),
        avatarBorder: z
          .string()
          .nullable()
          .meta({ description: "The avatar border the user has equipped, if any." }),
      })
      .meta({ description: "The user who uploaded the chapter." }),
  })

export const latestChapterFeedItemSchema = latestChapterSchema.extend({
  pageCount: z
    .int()
    .meta({ description: "The number of processed pages the chapter has.", example: 24 }),
  mediaId: chapterFeedItemSchema.shape.mediaId,
  mediaTitle: chapterFeedItemSchema.shape.mediaTitle,
  mediaCoverUrl: z
    .url()
    .nullable()
    .meta({ description: "URL of the main cover of the media the chapter belongs to, if any." }),
})

export const latestMediaUpdateSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z.string().nullable().meta({ description: "The main title of the media, if any." }),
  coverUrl: z.url().nullable().meta({ description: "The URL of the media's main cover, if any." }),
  countryOfOrigin: z
    .enum(MEDIA_COUNTRIES_OF_ORIGIN)
    .meta({ description: "The country the media originates from.", example: "JAPAN" }),
  contentRating: contentRatingSchema("The content rating of the media."),
  chapterCount: z.int().meta({
    description: "The number of chapters of the media that match the filters.",
    example: 12,
  }),
  chapters: latestChapterSchema
    .array()
    .meta({ description: "The matching chapters of the media, in the requested order." }),
})

export const groupPermissionsSchema = z
  .enum(GROUP_PERMISSIONS)
  .array()
  .max(GROUP_PERMISSIONS.length)
  .meta({
    description: "The group permissions to grant.",
    example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
  })

export const proofLinksSchema = z
  .url({ protocol: /^https?$/, normalize: true })
  .max(config.input.maxUrlLength)
  .array()
  .min(1)
  .max(5)
  .transform((links) => [...new Set(links)])
  .meta({
    description:
      "From 1 to 5 public links proving your claim, such as the group's site or announcement posts. Duplicates are ignored.",
    example: ["https://discord.gg/akira-scans"],
  })

export const requestMessageSchema = z.string().trim().min(1).max(2000).meta({
  description: "Who you are and why the request should be approved, up to 2000 characters.",
  example: "I founded Akira Scans in 2019 and still lead the team.",
})

export const reviewNoteSchema = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .meta({ description: "Explanation shown to the requester.", example: "No proof of ownership." })

export const displayNameSchema = z.string().trim().regex(config.auth.displayName.regex)

export const profileAboutSchema = z.partialRecord(
  z.enum(SUPPORTED_LANGUAGES),
  z.string().trim().max(2000),
)

export const profileCitySchema = z.string().trim().max(64)

export const userSummarySchema = z.object({
  id: z.uuid().meta({ description: "The ID of the user." }),
  username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
  displayUsername: z
    .string()
    .meta({ description: "The display name of the user.", example: "Kaito" }),
  image: z.string().nullable().meta({ description: "The URL of the user's avatar, if any." }),
  nameEffect: z
    .string()
    .nullable()
    .meta({ description: "The name effect the user has equipped, if any.", example: "gold" }),
  avatarBorder: z
    .string()
    .nullable()
    .meta({ description: "The avatar border the user has equipped, if any." }),
})

export const groupSummarySchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "The name of the group.", example: "Akira Scans" }),
  logo: z.string().nullable().meta({ description: "The key of the group's logo image, if any." }),
})

const emptyToNull = z.literal("").transform(() => null)

export const groupLinkSchema = (description: string) =>
  z.union([httpUrlSchema, emptyToNull]).nullable().optional().meta({ description })

export const groupDiscordSchema = z
  .union([httpUrlSchema, z.string().regex(/^(\/invite\/)?[A-Za-z0-9-]{2,64}$/), emptyToNull])
  .nullable()
  .optional()
  .meta({
    description: "The Discord invite link or code of the group. Send an empty string to clear it.",
    example: "akira-scans",
  })

export const groupEmailSchema = z
  .union([z.email().max(config.input.maxUrlLength), emptyToNull])
  .nullable()
  .optional()
  .meta({
    description: "The contact email of the group. Send an empty string to clear it.",
    example: "contact@akira-scans.com",
  })

export const chapterSubmissionSchema = latestChapterFeedItemSchema.extend({
  status: z
    .enum(CHAPTER_STATUSES)
    .meta({ description: "The review status of the chapter.", example: "PENDING" }),
  rejectionReason: z
    .string()
    .nullable()
    .meta({ description: "Why the chapter was rejected, if any.", example: "Pages are blurry." }),
  reviewedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the chapter was reviewed, if any." }),
  publishAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the chapter goes live, if it was scheduled." }),
})
