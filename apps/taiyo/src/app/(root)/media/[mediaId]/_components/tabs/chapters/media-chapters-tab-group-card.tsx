import type { MediaChapterGroup } from "@taiyomoe/types"
import { MediaChaptersTabRow } from "./card/media-chapters-tab-row"

type Props = {
  group: MediaChapterGroup
}

export const MediaChapterGroupCard = ({ group }: Props) => {
  const computeChapterOrder = (chapterIndex: number) => {
    if (group.chapters.length === 1) return "unique"
    if (chapterIndex === 0) return "first"
    if (chapterIndex === group.chapters.length - 1) return "last"

    return "middle"
  }

  return (
    <div>
      {group.chapters.map((chapter, i) => (
        <MediaChaptersTabRow
          key={chapter.id}
          chapter={chapter}
          order={computeChapterOrder(i)}
          index={i}
        />
      ))}
    </div>
  )
}
