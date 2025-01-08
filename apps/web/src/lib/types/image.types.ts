import type { UploadChapterInput } from "@taiyomoe/schemas"

export type SelectedFile = Required<UploadChapterInput["files"][number]>

export type RawSelectedFile = SelectedFile & {
  mimeType: string
  extension: string
}

export type InvalidFile = {
  reason: "mimeType" | "chapterNumber"
  path: string
}

export type ImageFolder = [number, File[]]
