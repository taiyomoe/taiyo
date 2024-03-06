import type { UploadSessionType } from "@prisma/client"
import { UploadResponse } from "@taiyomoe/types"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { useImageStore } from "~/stores"

export const useUpload = () => {
  const { getImages } = useImageStore()

  const upload = async (authToken: string, type: UploadSessionType) => {
    const formData = new FormData()

    for (const file of getImages(type)) {
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

    return data.files
  }

  return { upload }
}
