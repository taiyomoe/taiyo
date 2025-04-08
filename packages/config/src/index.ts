import { tagsKeys } from "./tags"

export const config = {
  files: {
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  tags: tagsKeys,
  pagination: {
    defaultPage: 1,
    defaultPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
  },
} as const
