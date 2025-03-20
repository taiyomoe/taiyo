import { tagsKeys } from "./tags"

export const config = {
  files: {
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  tags: tagsKeys,
} as const
