import type { TAG_KEYS } from "@taiyomoe/constants"

declare global {
  namespace PrismaJson {
    type MediaChapterPage = { id: string }
    type MediaCommentAttachement = { id: string; extension: "png" | "gif" }
    type MediaTag = { key: keyof typeof TAG_KEYS; isSpoiler: boolean }
    type UserLibraryEntry = { mediaId: string; updatedAt: string }
    type UserHistoryProgression = {
      updatedAt: string
      chapterId: string
      pageId: string | null
      completed: boolean
    }
  }
}
