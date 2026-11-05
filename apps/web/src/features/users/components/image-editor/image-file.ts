import { m } from "@/paraglide/messages"

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"]

const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/** The reason the server would refuse this file, or null when it is fine to edit. */
export const validateImageFile = (file: File) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return m.image_editor_invalid_type()
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return m.image_editor_too_large()
  }

  return null
}

/** The animated GIF path on the server cannot rotate, so the editor locks rotation for it. */
export const isAnimatedFormat = (file: File) => file.type === "image/gif"

/** The first file in a drop or paste that looks like an image, else the first file at all. */
export const pickImageFile = (files: FileList | null | undefined) => {
  const list = Array.from(files ?? [])

  return list.find((file) => file.type.startsWith("image/")) ?? list.at(0) ?? null
}
