import { SwipeableLatestMedias } from "./swiper/SwipeableLatestMedias";

export const LatestMedias = () => {
  return (
    <div className="flex h-full w-full flex-col gap-6">
      <p className="text-2xl font-medium">Últimas obras adicionadas</p>
      <SwipeableLatestMedias />
    </div>
  );
};
