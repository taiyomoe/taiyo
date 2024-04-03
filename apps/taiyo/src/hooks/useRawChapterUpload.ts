import type { SuccessfulUploadResponse, UploadResponse } from "@taiyomoe/types"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { useMutation } from "@tanstack/react-query"
import { api } from "~/trpc/react"

export const useRawChapterUpload = () => {
  const { mutateAsync: startUploadSession } =
    api.uploads.startUploadSession.useMutation()
  const { mutateAsync: uploadImages } = useMutation<
    SuccessfulUploadResponse,
    unknown,
    { authToken: string; files: File[] }
  >({
    mutationKey: ["uploadImages"],
    mutationFn: async ({ authToken, files }) => {
      const formData = new FormData()
      formData.append("type", "CHAPTER")

      for (const file of files) {
        formData.append("file", file)
      }

      const response = await fetch(MediaChapterUtils.getUploadEndpoint(), {
        method: "POST",
        headers: {
          Authorization: authToken,
        },
        body: formData,
      })

      const data = (await response.json()) as UploadResponse

      if ("error" in data) {
        throw new Error(data.error[0])
      }

      return data
    },
  })

  const upload =
    (_: { mediaId: string; number: number }, __: File[]) => async () => {}

  return {
    startUploadSession,
    uploadImages,
    upload,
  }
}
