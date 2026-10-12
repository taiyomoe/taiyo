import { IMAGE_MIME_TYPES, type ImageMimeType } from "@taiyomoe/db"

export const isImageMimeType = (value: string | undefined): value is ImageMimeType =>
  value !== undefined && value in IMAGE_MIME_TYPES
