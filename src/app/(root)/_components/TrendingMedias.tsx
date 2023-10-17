import { serverApi } from "~/utils/serverApi";
import { SwipeableTrendingMedias } from "./swiper/SwipeableTrendingMedias";

export const TrendingMedias = async () => {
  const medias = await serverApi.medias.getLatestMedias();

  return (
    <div className="flex min-w-[300px] flex-col gap-6">
      <p className="text-2xl font-medium">Em alta</p>
      <SwipeableTrendingMedias medias={medias} />
    </div>
  );
};
