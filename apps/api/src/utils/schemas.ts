import { config } from "@taiyomoe/config"
import { CONTENT_RATINGS, LANGUAGES } from "@taiyomoe/db"
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

export const mediaLinksSchema = z
  .object({
    mangaDex: z.uuid().optional().meta({ description: "MangaDex series UUID." }),
    anilist: z.int().positive().optional().meta({ description: "AniList numeric media ID." }),
    myAnimeList: z
      .int()
      .positive()
      .optional()
      .meta({ description: "MyAnimeList numeric media ID." }),
    animePlanet: z.url().optional().meta({ description: "Anime-Planet URL." }),
    bookWalker: z.url().optional().meta({ description: "BookWalker series URL." }),
    mangaUpdates: z.url().optional().meta({ description: "MangaUpdates series URL." }),
    novelUpdates: z.url().optional().meta({ description: "NovelUpdates series URL." }),
    kitsu: z.url().optional().meta({ description: "Kitsu manga URL." }),
    amazon: z.url().optional().meta({ description: "Amazon product URL." }),
    eBookJapan: z.url().optional().meta({ description: "eBookJapan product URL." }),
    raw: z.url().optional().meta({ description: "URL to the original raw publication." }),
    officialENTranslation: z
      .url()
      .optional()
      .meta({ description: "URL to the official English translation." }),
    officialFRTranslation: z
      .url()
      .optional()
      .meta({ description: "URL to the official French translation." }),
    officialPTBRTranslation: z
      .url()
      .optional()
      .meta({ description: "URL to the official Brazilian Portuguese translation." }),
    cdJapan: z.url().optional().meta({ description: "CDJapan product URL." }),
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
  z.string().max(config.input.maxUrlLength).optional().meta({ description })

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
