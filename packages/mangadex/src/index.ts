import {
  createMangaDexClient,
  type MangaDexChapter,
  type MangaDexClient,
  type MangaDexCover,
  type MangaDexGroup,
  MangaDexNotFoundError,
} from "./client"
import {
  CHAPTER_LANGUAGES,
  toChapterNumber,
  toChapterTitle,
  toContentRating,
  toGroupValues,
  toMangaDexLanguage,
  toMediaDemography,
  toMediaLanguage,
  toMediaLinks,
  toMediaStatus,
  toStaffLinks,
  toSupportedLanguage,
  toTagKey,
  toVolume,
} from "./mappings"

export {
  CHAPTER_LANGUAGES,
  createMangaDexClient,
  MangaDexNotFoundError,
  toChapterNumber,
  toChapterTitle,
  toContentRating,
  toGroupValues,
  toMangaDexLanguage,
  toMediaDemography,
  toMediaLanguage,
  toMediaLinks,
  toMediaStatus,
  toStaffLinks,
  toSupportedLanguage,
  toTagKey,
  toVolume,
}

export type { MangaDexChapter, MangaDexClient, MangaDexCover, MangaDexGroup }
