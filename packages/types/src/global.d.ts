import type { TAG_KEYS } from "."

declare global {
  namespace PrismaJson {
    type MediaChapterPage = { id: string }
    type MediaCommentAttachement = { id: string; extension: "png" | "gif" }
    type MediaTag = { key: keyof typeof TAGS_PT; isSpoiler: boolean }
    type UserLibraryEntry = { mediaId: string; updatedAt: string }
    type UserHistoryProgression = {
      updatedAt: string
      chapterId: string
      pageId: string | null
      completed: boolean
    }
  }
}
