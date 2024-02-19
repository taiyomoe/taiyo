import { PRELOAD_PAGES_COUNT } from "@taiyomoe/constants"
import type { MediaChapterLimited, MediaChapterPage } from "@taiyomoe/types"
import { env } from "../env"

const boundary = Math.floor(PRELOAD_PAGES_COUNT / 2)

const getImageUrl = (
  mediaChapter: MediaChapterLimited,
  page: MediaChapterPage,
) => {
  return `${env.NEXT_PUBLIC_CDN_URL}/medias/${mediaChapter.media.id}/chapters/${mediaChapter.id}/${page.id}.jpg`
}

const getAllImages = (mediaChapter: MediaChapterLimited) => {
  return mediaChapter.pages.map((page, index) => ({
    number: index + 1,
    url: getImageUrl(mediaChapter, page),
  }))
}

const getImagesChunk = (
  mediaChapter: MediaChapterLimited,
  currentPageNumber: number,
) => {
  const images: { number: number; url: string }[] = []

  for (
    let i = currentPageNumber - boundary;
    i <= currentPageNumber + boundary;
    i += 1
  ) {
    if (i < 0 || i > mediaChapter.pages.length) {
      continue
    }

    const page = mediaChapter.pages.at(i)

    if (page) {
      images.push({ number: i + 1, url: getImageUrl(mediaChapter, page) })
    }
  }

  return images
}

export const MediaChapterImageUtils = {
  getImageUrl,
  getAllImages,
  getImagesChunk,
}
