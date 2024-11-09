import type { ContentRating, Languages, Media, Prisma } from "@prisma/client"

export type ImportMediaInitialMessageInput = {
  payload: Prisma.MediaCreateInput
  mainCoverPayload: {
    url: string
    volume: number
    language: Languages
  }
}
export type ImportMediaInitialMessageOutput = Media

export type ImportCoverMessageInput = {
  url: string
  volume: number
  language: Languages
  contentRating: ContentRating
  mediaId: string
  uploaderId: string
  taskId: string
}

export type ImportChapterMessageInput = {
  mdId: string
  title: string | null
  number: number
  volume: number
  contentRating: ContentRating
  groupIds: string[]
  mediaId: string
  uploaderId: string
  taskId: string
}
