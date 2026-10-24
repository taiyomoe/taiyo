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
    contentRating: ["NORMAL", "SUGGESTIVE"],
    preferredTitles: "en",
    showFollowing: true,
    showLibrary: true,
    homeLayout: "ROWS",
    latestUpdatesLayout: "LIST",
  } satisfies Required<UserSettings>,
  images: {
    maxSizeBytes: 10 * 1024 * 1024,
    quality: 85,
    chapterPageQuality: 82,
    maxChapterPageSizeBytes: 15 * 1024 * 1024,
    maxChapterPages: 500,
    uploadUrlTtlSeconds: 600,
    stagingExpiryDays: 3,
    staleUploadReapHours: 24,
  },
  tags,
  pagination: {
    defaultPage: 1,
    defaultPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
  },
  input: {
    maxNameLength: 200,
    maxChapterTitleLength: 200,
    maxVolumeLength: 50,
    maxUrlLength: 500,
    maxDescriptionLength: 5000,
    maxSynopsisLength: 10000,
    maxChapterGroups: 10,
    maxPendingChapters: 100,
    maxReviewNoteLength: 2000,
    maxMediaTitles: 50,
    maxMediaTags: 100,
    maxMediaStaffs: 50,
    maxPendingSuggestions: 100,
  },
} as const
