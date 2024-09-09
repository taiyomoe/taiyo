import type { MediaLimitedChapter } from "@taiyomoe/types"
import { MediaChaptersTabRowActions } from "./media-chapters-tab-row-actions"
import { MediaChaptersTabRowCard } from "./media-chapters-tab-row-card"
import { MediaChaptersTabRowPath } from "./media-chapters-tab-row-path"

type Props = {
  chapter: MediaLimitedChapter
  order: "unique" | "first" | "middle" | "last"
  index: number
}

export const MediaChaptersTabRow = ({ chapter, order, index }: Props) => (
  <div id={`marquee-card-${index}`} className="flex gap-2">
    <MediaChaptersTabRowPath order={order} />
    <MediaChaptersTabRowCard
      chapter={chapter}
      order={order}
      index={index}
      noisyWidth={216}
    />
    <MediaChaptersTabRowActions chapter={chapter} />
  </div>
)
