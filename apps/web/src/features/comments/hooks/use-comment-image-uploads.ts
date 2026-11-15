import { config } from "@taiyomoe/config"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useState } from "react"
import { type UploadedImage, useUploadCommentImage } from "@/features/comments/api/comment-images"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const ACCEPTED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"])

export function useCommentImageUploads(onUploaded: (image: UploadedImage) => void) {
  const upload = useUploadCommentImage()
  const [pending, setPending] = useState(0)
  const start = (files: File[], slots: number) => {
    const accepted = files.filter((file) => {
      if (!ACCEPTED.has(file.type)) {
        toastManager.add({ title: m.comments_upload_type({ name: file.name }), type: "error" })

        return false
      }

      if (file.size > config.comments.maxImageSizeBytes) {
        toastManager.add({
          title: m.comments_upload_size({
            name: file.name,
            size: config.comments.maxImageSizeBytes / 1024 / 1024,
          }),
          type: "error",
        })

        return false
      }

      return true
    })

    if (accepted.length > slots) {
      toastManager.add({
        title: m.comments_upload_limit({ max: config.comments.maxImages }),
        type: "warning",
      })
    }

    for (const file of accepted.slice(0, Math.max(slots, 0))) {
      setPending((count) => count + 1)
      void upload
        .mutateAsync(file)
        .then(onUploaded, (error: unknown) => {
          toastManager.add({
            title: m.comments_upload_failed({ name: file.name }),
            description: getErrorMessage(error),
            type: "error",
          })
        })
        .finally(() => {
          setPending((count) => count - 1)
        })
    }
  }

  return { pending, start }
}
