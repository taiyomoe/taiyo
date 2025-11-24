import { tagsKeys } from "./tags"

export const config = {
  logger: {
    services: {
      api: "api",
    },
    defaultLevel: "info",
    minimumIntervalInMs: 1000,
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
  } satisfies Required<PrismaJson.UserSettings>,
  files: {
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  tags: tagsKeys,
  pagination: {
    defaultPage: 1,
    defaultPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
  },
} as const
