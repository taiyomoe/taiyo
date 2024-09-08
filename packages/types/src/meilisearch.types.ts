import type {
  MediaChapter,
  MediaTitle,
  MediaType,
  User,
  UserProfile,
} from "@prisma/client"

export type MeilisearchIndexes = "medias" | "chapters" | "scans" | "users"

export type MeilisearchIndexesItems<TIndex extends MeilisearchIndexes> =
  TIndex extends "medias"
    ? MediasIndexItem
    : TIndex extends "chapters"
      ? ChaptersIndexItem
      : TIndex extends "scans"
        ? ScansIndexItem
        : TIndex extends "users"
          ? UsersIndexItem
          : never

export type MediasIndexItem = {
  id: string
  synopsis: string | null
  titles: Pick<
    MediaTitle,
    "title" | "language" | "priority" | "isAcronym" | "isMainTitle"
  >[]
  type: MediaType
  mainCoverId: string
}

export type ScansIndexItem = {
  id: string
  name: string
}

export type ChaptersIndexItem = Omit<
  MediaChapter,
  "createdAt" | "updatedAt" | "deletedAt" | "pages"
> & {
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  scanIds: string[]
}

export type UsersIndexItem = Pick<User, "id" | "name" | "image" | "role"> &
  Pick<UserProfile, "about">
