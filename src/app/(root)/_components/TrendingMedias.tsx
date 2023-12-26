import type { LatestMedia } from "~/lib/types"

import { SwipeableTrendingMedias } from "./swiper/SwipeableTrendingMedias"

type Props = {
  trendingMedias: LatestMedia[]
}

export const TrendingMedias = ({ trendingMedias }: Props) => (
  <div className="sticky top-24 flex h-fit min-w-[300px] flex-col gap-6">
    <p className="text-2xl font-medium">Em alta</p>
    <SwipeableTrendingMedias medias={trendingMedias} />
  </div>
)
