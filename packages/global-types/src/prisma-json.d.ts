import type { config } from "@taiyomoe/config"
import type { ContentRating, Languages } from "@taiyomoe/db"

declare global {
  namespace PrismaJson {
    type LocalizedText = Partial<Record<Languages, string>>

    // Medias
    type MediaChapterPage = { id: string }
    type MediaTags = {
      key: keyof (typeof config)["tags"]
      isSpoiler: boolean
    }
    type MediaLinks = {
      mangaDex?: string
      myAnimeList?: number
      anilist?: number
      animePlanet?: string
      bookWalker?: string
      mangaUpdates?: string
      novelUpdates?: string
      kitsu?: string
      amazon?: string
      eBookJapan?: string
      raw?: string
      officialENTranslation?: string
      officialFRTranslation?: string
      officialPTBRTranslation?: string
      cdJapan?: string
    }
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

    // Users
    type UserSettings = {
      contentRating?: ContentRating[]
      preferredTitles?: Languages
      showFollowing?: boolean
      showLibrary?: boolean
      homeLayout?: "ROWS" | "COLUMNS"
    }
    type UserLibraryEntry = { mediaId: string; updatedAt: string }
    type UserHistoryProgression = {
      updatedAt: string
      chapterId: string
      pageId: string | null
      completed: boolean
    }
  }
}
