import { Skeleton } from "~/components/ui/Skeleton";
import { SwipeableLatestMedias } from "./swiper/SwipeableLatestMedias";

export const LatestMedias = () => {
  const items = Array.from({ length: 20 }, (_, index) => (
    <Skeleton key={index} className="h-[200px] w-[150px]" />
  ));

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <p className="text-2xl font-medium">Últimas obras adicionadas</p>
      <SwipeableLatestMedias items={items} />
    </div>
  );
};
