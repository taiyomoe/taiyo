import type { UploadChapterInput } from "@taiyomoe/schemas"

export const uploadChapterHandler = async (input: UploadChapterInput) => {
  console.log("inside uploadChapterHandler", input)

  await new Promise((resolve) => setTimeout(resolve, 5000))

  return "OK"
}
