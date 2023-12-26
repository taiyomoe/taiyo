import type { MediaChapterGroup } from "~/lib/types"

import { MediaChapterCardTemporary } from "./card/MediaChapterCardTemporary"

type Props = {
  group: MediaChapterGroup
}

export const MediaChapterGroupCard = ({ group }: Props) => {
  const computeChapterOrder = (chapterIndex: number) => {
    if (group.chapters.length === 1) return "unique"
    else if (chapterIndex === 0) return "first"
    else if (chapterIndex === group.chapters.length - 1) return "last"
    else return "middle"
  }

  return (
    <div>
      {group.chapters.map((chapter, i) => (
        <MediaChapterCardTemporary
          key={i}
          chapter={chapter}
          order={computeChapterOrder(i)}
        />
      ))}
    </div>
  )
}
