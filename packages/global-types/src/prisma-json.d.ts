import type { ContentRating, Languages } from "@prisma/client"
import type { config } from "@taiyomoe/config"

declare global {
  namespace PrismaJson {
    type HomeLayout = "ROWS" | "COLUMNS"

    type UserSettings = {
      contentRating?: ContentRating[]
      preferredTitles?: Languages
      showFollowing?: boolean
      showLibrary?: boolean
      homeLayout?: HomeLayout
    }
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
