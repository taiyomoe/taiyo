import { InsertMediaChapterFormSchema } from "@taiyomoe/schemas"
import { SuccessfulUploadResponse, UploadResponse } from "@taiyomoe/types"
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
  const { mutateAsync: createChapter } = api.mediaChapters.create.useMutation()

  const upload =
    (
      values:
        | InsertMediaChapterFormSchema
        | { mediaId: string; number: number },
      files: File[],
    ) =>
    async () => {
      const { mediaChapterId, authToken } = await startUploadSession({
        type: "CHAPTER",
        mediaId: values.mediaId,
      })

      const { files: filesId } = await uploadImages({
        authToken,
        files,
      })

      await createChapter({
        title: null,
        volume: null,
        contentRating: "NORMAL",
        language: "pt_br",
        scanIds: [],
        flag: "OK",
        id: mediaChapterId,
        pages: filesId,
        ...values,
      })
    }

  return {
    startUploadSession,
    uploadImages,
    createChapter,
    upload,
  }
}
