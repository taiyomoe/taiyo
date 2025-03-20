import type {
  Media,
  MediaChapter,
  MediaTitle,
  Scan,
  User,
  UserProfile,
} from "@prisma/client"

export type MediasIndexItem = Omit<
  Media,
  "createdAt" | "updatedAt" | "deletedAt" | "startDate" | "endDate"
> & {
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  startDate: number | null
  endDate: number | null
  titles: Pick<
    MediaTitle,
    "title" | "language" | "priority" | "isAcronym" | "isMainTitle"
  >[]
  mainCoverId: string
}

export type ScansIndexItem = Omit<
  Scan,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: number
  updatedAt: number
  deletedAt: number | null
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
