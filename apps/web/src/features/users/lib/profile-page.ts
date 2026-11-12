export const PROFILE_TABS = ["profile", "stats", "uploads", "lists", "comments"] as const

export type ProfileTab = (typeof PROFILE_TABS)[number]

export const PROFILE_UPLOADS_PER_PAGE = 10
