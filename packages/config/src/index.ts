import type { UserSettings } from "@taiyomoe/db"

export const config = {
  openapi: {
    title: "Taiyō API",
    description: [
      "Welcome to the Taiyō API, the API behind the Taiyō website. Everything the site does goes through these endpoints, so you can build your own app on top of them. Taiyō is open source: https://github.com/taiyomoe/taiyo.",
      "## Responses",
      "Every response is JSON wrapped in an envelope. A success has `success: true` and the payload in `data`; a failure has `success: false`, a stable error `code` and a human-readable `message`, plus `details` for validation errors. Both carry a `timestamp` and a `requestId` to quote when you report a problem.",
      "## Authentication",
      "Endpoints authenticate with the session cookie set when you sign in. Each endpoint ends its description with who can call it: **Authentication** says whether a session is needed, **Required roles** lists the roles allowed, and **Required access** names the resource-level access needed, such as being the owner of a list.",
      "## Pagination",
      "Paginated lists take `page` (from 1) and `perPage` query parameters and return `meta.page`, `meta.perPage` and `meta.total` next to `data`.",
      "## Limits",
      "A JSON request body larger than 1 MB fails with a 413 `PAYLOAD_TOO_LARGE`, whatever the endpoint. Endpoints that are rate limited list their 429 `RATE_LIMITED` response.",
    ].join("\n\n"),
  },
  auth: {
    username: {
      regex: /^[a-zA-Z0-9_.]{3,30}$/,
      minLength: 3,
      maxLength: 30,
    },
    displayName: {
      // Words of letters, numbers, dots and underscores separated by single ASCII spaces: other
      // whitespace or runs of spaces would render like another user's name.
      regex: /^(?=.{3,30}$)[a-zA-Z0-9_.]+(?: [a-zA-Z0-9_.]+)*$/,
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
    notifyChapters: true,
    notifyReplies: true,
    notifyLikes: true,
    notifyFollows: true,
    pushLibraryChapters: true,
    pushGroupChapters: true,
    pushReplies: true,
    pushLikes: true,
    pushFollows: true,
  } satisfies Required<UserSettings>,
  images: {
    maxSizeBytes: 10 * 1024 * 1024,
    maxFilesPerRequest: 10,
    quality: 85,
    chapterPageQuality: 82,
    maxChapterPageSizeBytes: 15 * 1024 * 1024,
    // Pixels decoded per page: a few kilobytes of flat colour can otherwise decode to sharp's
    // default limit of 268 megapixels. Long webtoon strips stay well under it.
    maxChapterPageDecodedPixels: 40_000_000,
    maxChapterPages: 500,
    // Covers, banners, staff photos, avatars and profile banners: pixels decoded across every
    // frame, and pixels produced across every frame of a cropped output.
    maxDecodedPixels: 60_000_000,
    maxFrames: 300,
    uploadUrlTtlSeconds: 600,
    stagingExpiryDays: 3,
    staleUploadReapHours: 24,
  },
  comments: {
    maxTextLength: 2000,
    maxImages: 4,
    maxImageSizeBytes: 8 * 1024 * 1024,
    maxImageDimension: 4096,
    maxImageFrames: 300,
    maxImageDecodedPixels: 60_000_000,
    maxStillOutputDimension: 1920,
    maxAnimatedOutputDimension: 640,
    imageQuality: 80,
    animatedImageQuality: 75,
    maxFavoriteImages: 500,
    orphanImageHours: 24,
    blockedImageHammingDistance: 5,
    maxReportDetailsLength: 500,
    perPage: 20,
    repliesPerPage: 10,
    previewReplies: 3,
  },
  notifications: {
    drainBatchSize: 50,
    maxChapterAgeDays: 7,
    readRetentionDays: 90,
    unreadRetentionDays: 365,
    pushBatchSize: 100,
    pushConcurrency: 20,
    pushMaxAgeMinutes: 60,
    pushTtlSeconds: 24 * 60 * 60,
    maxPushSubscriptions: 10,
    activityPushDelayMinutes: 5,
    maxBulkIds: 100,
  },
  reports: {
    /** The points a reporter earns when the moderation team acts on their report. */
    rewardPoints: 10,
  },
  lists: {
    maxItems: 500,
    maxPerUser: 100,
    previewCovers: 4,
  },
  mangaDex: {
    apiUrl: "https://api.mangadex.org",
    uploadsUrl: "https://uploads.mangadex.org",
    networkReportUrl: "https://api.mangadex.network/report",
    // MangaDex rejects requests without a User-Agent naming the client.
    userAgent: "Taiyo (+https://taiyo.moe)",
    // MangaDex allows about 5 requests a second per IP, and 40 a minute to /at-home/server.
    requestIntervalMs: 300,
    atHomeIntervalMs: 1600,
    maxAttempts: 5,
    pageSize: 100,
    feedPageSize: 500,
    maxSelectedItems: 5000,
    recentSyncs: 10,
    maxDownloadBytes: 25 * 1024 * 1024,
  },
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
    maxReviewBatch: 100,
    maxBulkBatch: 100,
    maxReviewNoteLength: 2000,
    maxMediaTitles: 50,
    maxMediaTags: 100,
    maxMediaStaffs: 50,
    maxFeaturedMedias: 20,
    maxPendingSuggestions: 100,
    // Issues a 422 carries: enough to fix a request, while one issue per bad array element would
    // grow the response with the request.
    maxValidationIssues: 10,
    // Stated in `openapi.description`: change both together.
    maxJsonBodyBytes: 1024 * 1024,
  },
} as const

export { tags } from "./tags"

export * from "./tag-keys"
