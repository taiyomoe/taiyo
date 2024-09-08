export type InvalidFile = {
  reason: "mimeType" | "chapterNumber"
  path: string
}

export type ImageFolder = [number, File[]]
