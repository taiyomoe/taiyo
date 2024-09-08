export const DEFAULT_MEDIA_PER_PAGE = 30
export const MEDIA_PER_PAGE_CHOICES = [5, 10, 20, 30, 50]

export const DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE = 10
export const LATEST_CHAPTERS_GROUPED_PER_PAGE_CHOICES = [5, 10, 20, 30, 50]

export const DEFAULT_CHAPTERS_LIST_PER_PAGE = 20
export const CHAPTERS_LIST_PER_PAGE_CHOICES = [5, 10, 20, 30, 50]
export const CHAPTERS_LIST_SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "deletedAt",
  "title",
  "number",
  "volume",
  "language",
  "contentRating",
  "flag",
  "uploader",
  "media",
  "scans",
  "deleter",
] as const

export const DEFAULT_SCANS_LIST_PER_PAGE = 20
export const SCANS_LIST_PER_PAGE_CHOICES = [5, 10, 20, 30, 50]
export const SCANS_LIST_SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "deletedAt",
  "name",
  "description",
  "logo",
  "banner",
  "website",
  "discord",
  "twitter",
  "facebook",
  "instagram",
  "telegram",
  "youtube",
  "email",
  "creator",
  "deleter",
] as const

export const DEFAULT_USER_FOLLOWS_PER_PAGE = 30
export const USER_FOLLOWS_PER_PAGE_CHOICES = [10, 20, 30, 50]

export const DEFAULT_GROUPED_CHAPTERS_LIMIT = 3
export const DEFAULT_GROUPED_CHAPTERS_PER_PAGE = 5
export const GROUPED_CHAPTERS_CHOICES = [5, 10, 20, 30]

export const PRELOAD_PAGES_COUNT = 5

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

export * from "./tags"
