import type { MediaChapter } from "@/lib/queries/medias"

import { m } from "../../paraglide/messages"
import { getLocale } from "../../paraglide/runtime"

export type ChapterLabelInput = Pick<MediaChapter, "number" | "volume" | "title"> & {
  language: string
}

const formatChapterNumber = (value: number) =>
  new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 2 }).format(value)

export const languageName = (code: string) => {
  try {
    return (
      new Intl.DisplayNames([getLocale()], { type: "language" }).of(code.replace("_", "-")) ?? code
    )
  } catch {
    return code
  }
}

export const chapterHeading = ({ number, volume }: Pick<ChapterLabelInput, "number" | "volume">) =>
  volume === null
    ? m.chapter_number({ number: formatChapterNumber(number) })
    : m.chapter_volume_number({ volume, number: formatChapterNumber(number) })

export const getChapterLabel = (chapter: ChapterLabelInput) => ({
  heading: chapterHeading(chapter),
  title: chapter.title,
  language: languageName(chapter.language),
})
