import type { MediaType } from "@taiyomoe/db/constants"
import type { QuickSearchResults } from "@/features/command-palette/api/quick-search"
import type {
  GroupEntity,
  TitleEntity,
  UserEntity,
} from "@/features/command-palette/lib/palette-command"
import { getSynopsis } from "@/features/media/lib/media-labels"

const SYNOPSIS_LENGTH = 220

export const toTitleEntity = (title: {
  id: string
  title: string
  matchedTitle?: string | null
  synopsis: Partial<Record<string, string>>
  coverUrl: string | null
  type: MediaType
  startDate: number | string | null
}): TitleEntity => ({
  kind: "title",
  id: title.id,
  title: title.title,
  matchedTitle: title.matchedTitle ?? null,
  synopsis: getSynopsis(title.synopsis).join(" ").slice(0, SYNOPSIS_LENGTH),
  coverUrl: title.coverUrl,
  type: title.type,
  year: title.startDate === null ? null : new Date(title.startDate).getUTCFullYear(),
})

export const toGroupEntity = (group: QuickSearchResults["groups"][number]): GroupEntity => ({
  kind: "group",
  ...group,
})

export const toUserEntity = (user: QuickSearchResults["users"][number]): UserEntity => ({
  kind: "user",
  ...user,
})
