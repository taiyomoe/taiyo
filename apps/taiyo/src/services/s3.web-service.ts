import { parallel } from "radash"
import type { SelectedFile } from "~/lib/types"

const upload = async (
  input: (SelectedFile & { url: string })[],
  onError?: (fileName: string) => void,
) => {
  const uploaded = await parallel(
    10,
    input,
    async ({ url, file, name, mimeType, size }) => {
      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": mimeType,
          "Content-Length": String(size),
        },
      })

      if (!res.ok) {
        onError?.(name)

        return null
      }

      return "OK"
    },
  )

  return uploaded
}

export const S3Service = {
  upload,
}
