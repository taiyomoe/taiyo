import type { Group, Media, Title, User, UserProfile } from "@prisma/client"

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
    Title,
    "title" | "language" | "priority" | "isAcronym" | "isMainTitle"
  >[]
  mainCoverId: string
}

export type GroupsIndexItem = Omit<
  Group,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

export type UsersIndexItem = Pick<User, "id" | "name" | "image" | "role"> &
  Pick<UserProfile, "about">
