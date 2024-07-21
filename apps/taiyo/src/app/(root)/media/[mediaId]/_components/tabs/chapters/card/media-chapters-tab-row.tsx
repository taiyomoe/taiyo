import type { MediaLimitedChapter } from "@taiyomoe/types"
import { MediaChaptersTabRowActions } from "./media-chapters-tab-row-actions"
import { MediaChaptersTabRowCard } from "./media-chapters-tab-row-card"
import { MediaChaptersTabRowPath } from "./media-chapters-tab-row-path"

type Props = {
  chapter: MediaLimitedChapter
  order: "unique" | "first" | "middle" | "last"
}

export const MediaChaptersTabRow = ({ chapter, order }: Props) => (
  <div className="flex gap-2">
    <MediaChaptersTabRowPath order={order} />
    <MediaChaptersTabRowCard chapter={chapter} order={order} />
    <MediaChaptersTabRowActions chapter={chapter} />
  </div>
)
