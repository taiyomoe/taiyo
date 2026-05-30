import type { ContentRating, Language } from "./constants"

export type LocalizedText = Partial<Record<Language, string>>

export type ChapterPage = { id: string }

export type MediaTags = {
  key: string
  isSpoiler: boolean
}

export type MediaLinks = {
  mangaDex?: string
  myAnimeList?: number
  anilist?: number
  animePlanet?: string
  bookWalker?: string
  mangaUpdates?: string
  novelUpdates?: string
  kitsu?: string
  amazon?: string
  eBookJapan?: string
  raw?: string
  officialENTranslation?: string
  officialFRTranslation?: string
  officialPTBRTranslation?: string
  cdJapan?: string
}

export type StaffLink = {
  website?: string
  twitter?: string
  youtube?: string
  tumblr?: string
  discord?: string
  fanbox?: string
  fantia?: string
  pixiv?: string
  melonBooks?: string
  namicomi?: string
  naver?: string
  nicoVideo?: string
  skeb?: string
  weibo?: string
  booth?: string
}

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
