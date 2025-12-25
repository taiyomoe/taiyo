import type { config } from "@taiyomoe/config"
import type { ContentRating, Languages } from "@taiyomoe/db"

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
    type MediaTag = {
      key: keyof (typeof config)["tags"]
      isSpoiler: boolean
    }
    type MediaLinks = {
      mangaDex?: string
      myAnimeList?: number
      anilist?: number
    }
    type UserLibraryEntry = { mediaId: string; updatedAt: string }
    type UserHistoryProgression = {
      updatedAt: string
      chapterId: string
      pageId: string | null
      completed: boolean
    }
    type TaskPayload = Record<string, unknown>
    type StaffLink = {
      website?: string
      twitter?: string
      youtube?: string
      tumblr?: string
      discord?: string
      fanbox?: string
      fantia?: string
      pixiv?: string
      melonBooks?: string
      namicomi?: string
      naver?: string
      nicoVideo?: string
      skeb?: string
      weibo?: string
      booth?: string
    }
  }
}
