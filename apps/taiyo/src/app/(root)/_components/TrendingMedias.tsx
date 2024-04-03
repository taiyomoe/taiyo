import type { LatestMedia } from "@taiyomoe/types"
import { SwipeableTrendingMedias } from "./swipers/SwipeableTrendingMedias"

type Props = {
  trendingMedias: LatestMedia[]
}

export const TrendingMedias = ({ trendingMedias }: Props) => (
  <div className="sticky top-24 flex h-fit min-w-[300px] flex-col gap-6">
    <p className="font-medium text-2xl">Em alta</p>
    <SwipeableTrendingMedias medias={trendingMedias} />
  </div>
)
