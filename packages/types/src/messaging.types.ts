import type { ContentRating, Languages, Media, Prisma } from "@prisma/client"
import type { CreateMediaInput, UploadChapterInput } from "@taiyomoe/schemas"

export type ImportMediaInitialMessageInput = {
  payload: Prisma.MediaCreateInput
  mainCoverPayload: {
    url: string
    volume: number | null
    language: Languages
  }
}
export type ImportMediaInitialMessageOutput = Media

export type ImportCoverMessageInput = {
  url: string
  volume: number | null
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
  volume: number | null
  contentRating: ContentRating
  groupIds: string[]
  mediaId: string
  uploaderId: string
  taskId: string
}

export type CreateMediaMessageInput = Omit<CreateMediaInput, "mainCover"> & {
  mainCover: Buffer
  creatorId: string
}
export type CreateMediaMessageOutput = Media

export type UploadChapterMessageInput = Omit<UploadChapterInput, "files"> & {
  id: string
  pages: string[]
  uploaderId: string
}
