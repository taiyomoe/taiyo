import { api } from "~/lib/trpc/server";
import { SwipeableTrendingMedias } from "./swiper/SwipeableTrendingMedias";

export const TrendingMedias = async () => {
  const medias = await api.medias.getLatestMedias.query();

  return (
    <div className="flex min-w-[300px] flex-col gap-6">
      <p className="text-2xl font-medium">Em alta</p>
      <SwipeableTrendingMedias medias={medias} />
    </div>
  );
};
