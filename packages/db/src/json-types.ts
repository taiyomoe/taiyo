import type {
  ContentRating,
  Language,
  LatestUpdatesLayout,
  ListModerationAction,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaLink,
  MediaLinkNumberKey,
  MediaSource,
  MediaStatus,
  MediaType,
  ProfileModerationField,
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
}>

export type StaffLinks = Partial<Record<StaffLink, string>>

export type MangaDexSyncItemDetails = {
  language: string
  volume: string | null
  number?: number
  title?: string | null
  groups?: string[]
}

export type MangaDexSyncSummary = Partial<
  Record<"titles" | "synopses" | "staff" | "tags" | "links" | "fields", number>
>

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

/**
 * What a moderation notification is about. IDs are kept without foreign keys: the notification
 * outlives the comment, chapter or group it points at.
 */
export type NotificationPayload =
  | { listId: string; action: ListModerationAction }
  | { fields: ProfileModerationField[] }
  | ({ reportId: string; outcome: "RESOLVED" | "DISMISSED" } & (
      | { kind: "PAGE"; chapterId: string }
      | { kind: "COMMENT"; commentId: string }
      | { kind: "GROUP"; groupId: string }
      | { kind: "USER"; userId: string }
    ))
