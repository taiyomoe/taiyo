export type InvalidFile = {
  reason: "mimeType" | "chapterNumber"
  path: string
}

export type ImageFolder = [number, File[]]

export type ImageError = { message: string; chapterNumber: number }
