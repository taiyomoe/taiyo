import type { LatestMedia } from "~/lib/types";

import { SwipeableTrendingMedias } from "./swiper/SwipeableTrendingMedias";

type Props = {
  trendingMedias: LatestMedia[];
};

export const TrendingMedias = ({ trendingMedias }: Props) => (
  <div className="flex min-w-[300px] flex-col gap-6">
    <p className="text-2xl font-medium">Em alta</p>
    <SwipeableTrendingMedias medias={trendingMedias} />
  </div>
);
