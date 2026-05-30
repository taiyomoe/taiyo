import type { MediaLinks, StaffLink, UserSettings } from "@taiyomoe/db"
import { tags } from "./tags"

export const config = {
  logger: {
    services: {
      api: "api",
    },
    defaultLevel: "info",
    minimumIntervalInMs: 1000,
  },
  openapi: {
    title: "Taiyō API",
    description:
      "Welcome to the Taiyō API! This is the official API for the Taiyō project. Here you can find all the information you need to build your own application.\n\nOh, and by the way, we're open-source https://github.com/taiyomoe/taiyo :)",
  },
  auth: {
    username: {
      regex: /^[a-zA-Z0-9_.]{3,30}$/,
      minLength: 3,
      maxLength: 30,
    },
    displayName: {
      regex: /^[a-zA-Z0-9_.\s]{3,30}$/,
      minLength: 3,
      maxLength: 30,
    },
    password: {
      minLength: 8,
      maxLength: 50,
    },
  },
  settings: {
    contentRating: ["NORMAL", "SUGGESTIVE", "NSFL"],
    preferredTitles: "en",
    showFollowing: true,
    showLibrary: true,
    homeLayout: "ROWS",
  } satisfies Required<UserSettings>,
  images: {
    /** Default maximum image size in bytes (5MB) */
    maxSizeBytes: 5 * 1024 * 1024,
    /** JPEG quality for processed images (1-100) */
    quality: 85,
    /** Allowed image mime types */
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  medias: {
    links: [
      "anilist",
      "animePlanet",
      "bookWalker",
      "mangaUpdates",
      "novelUpdates",
      "myAnimeList",
      "kitsu",
      "amazon",
      "eBookJapan",
      "raw",
      "officialENTranslation",
      "officialFRTranslation",
      "officialPTBRTranslation",
      "cdJapan",
    ] satisfies (keyof MediaLinks)[],
  },
  staff: {
    links: [
      "website",
      "twitter",
      "youtube",
      "tumblr",
      "discord",
      "fanbox",
      "fantia",
      "pixiv",
      "melonBooks",
      "namicomi",
      "naver",
      "nicoVideo",
      "skeb",
      "weibo",
      "booth",
    ] satisfies (keyof StaffLink)[],
  },
  tags,
  pagination: {
    defaultPage: 1,
    defaultPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
  },
} as const
