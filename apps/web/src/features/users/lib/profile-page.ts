export const PROFILE_TABS = [
  "profile",
  "stats",
  "achievements",
  "uploads",
  "lists",
  "comments",
  "reviews",
] as const

export type ProfileTab = (typeof PROFILE_TABS)[number]

export const PROFILE_UPLOADS_PER_PAGE = 10
