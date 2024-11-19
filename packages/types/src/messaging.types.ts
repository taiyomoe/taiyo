import type { ContentRating } from "@prisma/client"
import type {
  CreateMediaInput,
  UploadChapterInput,
  UploadCoverInput,
} from "@taiyomoe/schemas"
import type { ParsedMdChapter, ParsedMdCover } from "./md.types"

export type ImportMediaMessageInput = {
  mdId: string
  creatorId: string
}

export type ImportCoverMessageInput = ParsedMdCover & {
  contentRating: ContentRating
  mediaId: string
  uploaderId: string
  taskId: string
  sessionId: string
}

export type ImportChapterMessageInput = ParsedMdChapter & {
  contentRating: ContentRating
  mediaId: string
  uploaderId: string
  taskId: string
  sessionId: string
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
