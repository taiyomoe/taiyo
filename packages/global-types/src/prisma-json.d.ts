import type { config } from "@taiyomoe/config"

declare global {
  namespace PrismaJson {
    type MediaChapterPage = { id: string }
    type MediaCommentAttachement = { id: string; extension: "png" | "gif" }
    type MediaTag = { key: (typeof config)["tags"][number]; isSpoiler: boolean }
    type UserLibraryEntry = { mediaId: string; updatedAt: string }
    type UserHistoryProgression = {
      updatedAt: string
      chapterId: string
      pageId: string | null
      completed: boolean
    }
    type TaskPayload = Record<string, unknown>
  }
}
