import { PRELOAD_PAGES_COUNT } from "@taiyomoe/constants"
import type { MediaChapterLimited, MediaChapterPage } from "@taiyomoe/types"
import { env } from "../env"

const boundary = Math.floor(PRELOAD_PAGES_COUNT / 2)

const getImageUrl = (chapter: MediaChapterLimited, page: MediaChapterPage) =>
  `${env.NEXT_PUBLIC_CDN_URL}/medias/${chapter.media.id}/chapters/${chapter.id}/${page.id}.jpg`

const getAllImages = (chapter: MediaChapterLimited) =>
  chapter.pages.map((page, index) => ({
    number: index + 1,
    url: getImageUrl(chapter, page),
  }))

const getImagesChunk = (chapter: MediaChapterLimited, currentPage: number) => {
  const images: { number: number; url: string }[] = []

  for (let i = currentPage - boundary; i <= currentPage + boundary; i += 1) {
    if (i < 0 || i > chapter.pages.length) {
      continue
    }

    const page = chapter.pages.at(i)

    if (page) {
      images.push({ number: i + 1, url: getImageUrl(chapter, page) })
    }
  }

  return images
}

export const ChapterImageUtils = {
  getImageUrl,
  getAllImages,
  getImagesChunk,
}
