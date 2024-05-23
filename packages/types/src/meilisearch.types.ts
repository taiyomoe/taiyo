import type { MediaTitle, MediaType } from "@prisma/client"

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
