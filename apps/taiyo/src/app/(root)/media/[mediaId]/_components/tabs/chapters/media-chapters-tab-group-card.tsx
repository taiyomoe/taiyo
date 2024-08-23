import type { MediaChapterGroup } from "@taiyomoe/types"
import { ChapterUtils } from "@taiyomoe/utils"
import { MediaChaptersTabRow } from "./card/media-chapters-tab-row"

type Props = {
  group: MediaChapterGroup
}

export const MediaChapterGroupCard = ({ group }: Props) => (
  <div>
    {group.chapters.map((chapter, i) => (
      <MediaChaptersTabRow
        key={chapter.id}
        chapter={chapter}
        order={ChapterUtils.computeOrder(i, group.chapters.length)}
        index={i}
      />
    ))}
  </div>
)
