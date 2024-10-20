import type {
  ContentRating,
  Languages,
  Media,
  MediaCover,
  Prisma,
} from "@prisma/client"

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
}
export type ImportCoverMessageOutput = MediaCover
