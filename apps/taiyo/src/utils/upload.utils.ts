"use client"

import { uploadChapterSchema } from "@taiyomoe/schemas"
import { fileTypeFromBlob } from "file-type"
import { parallel } from "radash"
import { toast } from "sonner"
import type { RawSelectedFile, SelectedFile } from "~/lib/types"

/**
 * This function parses the files and returns a list of objects with the parsed data.
 * If the file couldn't be parsed, it shows an error toast and returns null.
 */
const parseFiles = (input: File[]) =>
  parallel(10, input, async (file) => {
    const parsed = await fileTypeFromBlob(file)

    if (!parsed) {
      toast.error(
        `Não foi possível ler o ficheiro ${file.name}. Talvez ele esteja corrompido?`,
      )

      return null
    }

    return {
      name: file.name,
      size: file.size,
      mimeType: parsed.mime,
      extension: parsed.ext,
      file,
    }
  })

const validateFiles = (input: RawSelectedFile[]) => {
  const validated = []

  for (const parsedFile of input) {
    const { error, data } =
      uploadChapterSchema.shape.files.element.safeParse(parsedFile)

    if (error) {
      toast.error(
        `Extensão ou MimeType do ficheiro ${parsedFile!.file.name} inválida`,
      )

      validated.push(null)

      continue
    }

    validated.push(data)
  }

  return validated
}

const sortFiles = (input: SelectedFile[]) =>
  input.sort(
    (a, b) =>
      Number.parseInt(a?.file?.name.match(/\d+/)?.[0] || "0") -
      Number.parseInt(b?.file?.name.match(/\d+/)?.[0] || "0"),
  )

const handleDrop =
  (cb: (files: ReturnType<typeof sortFiles>) => void) =>
  async (files: File[]) => {
    const parsedFiles = await parseFiles(files)

    if (parsedFiles.includes(null)) {
      return
    }

    const validatedFiles = validateFiles(parsedFiles as RawSelectedFile[])

    if (validatedFiles.includes(null)) {
      return
    }

    const sortedFiles = sortFiles(validatedFiles as SelectedFile[])

    cb(sortedFiles)
  }

export const UploadUtils = {
  handleDrop,
}
