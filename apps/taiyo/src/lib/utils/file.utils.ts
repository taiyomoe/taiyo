import { ALLOWED_MIME_TYPES } from "@taiyomoe/constants"
import type { ImageFolder, InvalidFile } from "~/lib/types"

const computeRelativePaths = (files: FileList) => {
  const invalidFiles: InvalidFile[] = []
  const chapters: ImageFolder[] = []

  for (const entry of files) {
    const [chapterNumber, fileName] = entry.webkitRelativePath
      .split("/")
      .slice(-2)

    if (fileName === ".DS_Store") {
      continue
    }

    if (!ALLOWED_MIME_TYPES.includes(entry.type)) {
      invalidFiles.push({
        reason: "mimeType",
        path: entry.webkitRelativePath,
      })

      continue
    }

    if (!chapterNumber || Number.isNaN(Number.parseFloat(chapterNumber))) {
      invalidFiles.push({
        reason: "chapterNumber",
        path: entry.webkitRelativePath,
      })

      continue
    }

    const parsedChapterNumber = Number.parseFloat(chapterNumber)
    const chapterIndex = chapters.findIndex(
      ([chapNum]) => chapNum === parsedChapterNumber,
    )

    if (chapterIndex === -1) {
      chapters.push([parsedChapterNumber, [entry]])

      continue
    }

    chapters.at(chapterIndex)?.[1].push(entry)
  }

  return {
    invalidFiles,
    chapters,
  }
}

export const FileUtils = {
  computeRelativePaths,
}
