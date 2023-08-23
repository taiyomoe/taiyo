import { SwipeableTrendingMedias } from "./swiper/SwipeableTrendingMedias";

export const TrendingMedias = () => {
  return (
    <div className="flex min-w-[300px] flex-col gap-6">
      <p className="text-2xl font-medium">Em alta</p>
      <SwipeableTrendingMedias />
    </div>
  );
};
