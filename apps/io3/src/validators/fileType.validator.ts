import { fileTypeFromBlob } from "file-type"
import { DEFAULT_MIME_TYPES } from "~/utils/constants"

export const fileTypeValidator = async ({
  body,
}: { body: { file?: File; files?: File[] } }) => {
  const files = body.file ? [body.file] : body.files

  if (!files || files.length === 0) {
    throw new Error("No file found in the request")
  }

  const validated = await Promise.all(
    files.map(async (file) => {
      console.log("inside fileTypeValidator", file.name, file.stream())

      const parsed = await fileTypeFromBlob(file)

      if (!parsed) return false

      return DEFAULT_MIME_TYPES.includes(parsed.mime)
    }),
  )

  if (validated.some((v) => !v)) {
    const errors = files
      .filter((_, i) => !validated[i])
      .map(
        (f) =>
          `The file type of '${
            f.name
          }' is invalid. Allowed types: ${DEFAULT_MIME_TYPES.join(", ")}.`,
      )

    throw new Error(errors.join())
  }
}
