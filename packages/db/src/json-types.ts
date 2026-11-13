import type {
  ContentRating,
  Language,
  LatestUpdatesLayout,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaLink,
  MediaLinkNumberKey,
  MediaRelationType,
  MediaSource,
  MediaStatus,
  MediaType,
  StaffLink,
  StaffRole,
} from "./constants"

export type LocalizedText = Partial<Record<Language, string>>

export type ChapterPage = {
  id: string
}

export type MediaTags = {
  key: string
  isSpoiler: boolean
}

export type MediaLinks = Partial<{
  [K in MediaLink]: K extends MediaLinkNumberKey ? number : string
}>

export type MediaEditTitle = {
  title: string
  language: Language
  isAcronym: boolean
  isMainTitle: boolean
}

export type MediaEditStaff = {
  staffId: string
  role: StaffRole
}

export type MediaEditRelation = {
  mediaId: string
  type: MediaRelationType
}

export type MediaEdit = Partial<{
  titles: MediaEditTitle[]
  synopsis: LocalizedText
  type: MediaType
  status: MediaStatus
  source: MediaSource
  demography: MediaDemography
  countryOfOrigin: MediaCountryOfOrigin
  contentRating: ContentRating
  startDate: string | null
  endDate: string | null
  tags: MediaTags[]
  links: MediaLinks
  staffs: MediaEditStaff[]
  relations: MediaEditRelation[]
}>

export type MediaSimilarityItem = {
  mediaId: string
  score: number
  tags: string[]
  staff: boolean
  readers: boolean
}

export type StaffLinks = Partial<Record<StaffLink, string>>

export type UserSettings = {
  contentRating?: ContentRating[]
  preferredTitles?: Language
  showFollowing?: boolean
  showLibrary?: boolean
  homeLayout?: "ROWS" | "COLUMNS"
  latestUpdatesLayout?: LatestUpdatesLayout
  notifyChapters?: boolean
  notifyReplies?: boolean
  notifyLikes?: boolean
  notifyFollows?: boolean
  pushLibraryChapters?: boolean
  pushGroupChapters?: boolean
  pushReplies?: boolean
  pushLikes?: boolean
  pushFollows?: boolean
}
