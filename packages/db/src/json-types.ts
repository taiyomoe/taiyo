import type { ContentRating, Language, MediaLink, MediaLinkNumberKey, StaffLink } from "./constants"

export type LocalizedText = Partial<Record<Language, string>>

export type ChapterPage = { id: string }

export type MediaTags = {
  key: string
  isSpoiler: boolean
}

export type MediaLinks = Partial<{
  [K in MediaLink]: K extends MediaLinkNumberKey ? number : string
}>

export type StaffLinks = Partial<Record<StaffLink, string>>

export type UserSettings = {
  contentRating?: ContentRating[]
  preferredTitles?: Language
  showFollowing?: boolean
  showLibrary?: boolean
  homeLayout?: "ROWS" | "COLUMNS"
}

export type UserLibraryEntry = {
  mediaId: string
  updatedAt: string
}

export type UserHistoryProgression = {
  updatedAt: string
  chapterId: string
  pageId: string | null
  completed: boolean
}
