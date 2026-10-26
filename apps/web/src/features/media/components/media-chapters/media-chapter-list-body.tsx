import * as stylex from "@stylexjs/stylex"
import type { MediaChapter } from "@/features/chapters/api/chapters"
import { ChapterList, ChapterListSkeleton } from "@/features/chapters/components/chapter-list"
import { MediaChapterListEmpty } from "@/features/media/components/media-chapters/media-chapter-list-empty"

const styles = stylex.create({
  stale: {
    opacity: 0.6,
    transitionDuration: "150ms",
    transitionProperty: "opacity",
  },
})

type MediaChapterListBodyProps = {
  chapters: MediaChapter[] | undefined
  stale: boolean
  filtered: boolean
  onClear: () => void
}

export function MediaChapterListBody({
  chapters,
  stale,
  filtered,
  onClear,
}: MediaChapterListBodyProps) {
  if (chapters === undefined) {
    return <ChapterListSkeleton count={6} />
  }

  if (chapters.length === 0) {
    return <MediaChapterListEmpty filtered={filtered} onClear={onClear} />
  }

  return <ChapterList chapters={chapters} sx={stale && styles.stale} />
}
