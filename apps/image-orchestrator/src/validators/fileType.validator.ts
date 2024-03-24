import { fileTypeFromBlob } from "file-type"
import { DEFAULT_MIME_TYPES } from "../utils/constants"
import { InvalidFilesError } from "../utils/errors"

export const fileTypeValidator = async ({
  body,
}: { body: { file?: File; files?: File[] } }) => {
  const files = body.file ? [body.file] : body.files

  if (!files || files.length === 0) {
    throw new Error("No file found in the request")
  }

  const validated = await Promise.all(
    files.map(async (file) => {
      const parsed = await fileTypeFromBlob(file)

      if (!parsed) return false

      return DEFAULT_MIME_TYPES.includes(parsed.mime)
    }),
  )

  if (validated.some((v) => !v)) {
    const invalidFiles = files.filter((_, i) => !validated[i])

    throw new InvalidFilesError(invalidFiles)
  }
}
