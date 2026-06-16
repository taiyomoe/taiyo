import type { UserSettings } from "@taiyomoe/db"
import { tags } from "./tags"

export const config = {
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
  },
  tags,
  pagination: {
    defaultPage: 1,
    defaultPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
  },
  input: {
    /** Names: group name, staff name, media title. */
    maxNameLength: 200,
    /** Chapter title — kept short to align with reader UI. */
    maxChapterTitleLength: 200,
    /** Chapter volume tag — short label like "1", "1.5", "Special". */
    maxVolumeLength: 50,
    /** URL fields: websites, social handles, storage keys. */
    maxUrlLength: 500,
    /** Free-form descriptions: group description, staff description. */
    maxDescriptionLength: 5000,
    /** Per-language synopsis. */
    maxSynopsisLength: 10000,
  },
} as const
