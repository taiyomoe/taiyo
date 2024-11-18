import type { ContentRating, Languages, Media, Prisma } from "@prisma/client"
import type {
  CreateMediaInput,
  UploadChapterInput,
  UploadCoverInput,
} from "@taiyomoe/schemas"

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
  id: string
  mainCover: string
  creatorId: string
}

export type UploadCoverMessageInput = Omit<UploadCoverInput, "file"> & {
  id: string
  cover: string
  uploaderId: string
}

export type UploadChapterMessageInput = Omit<UploadChapterInput, "files"> & {
  id: string
  pages: string[]
  uploaderId: string
}
