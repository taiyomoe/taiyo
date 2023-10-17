import { api } from "~/lib/trpc/server";
import { SwipeableLatestMedias } from "./swiper/SwipeableLatestMedias";

export const LatestMedias = async () => {
  const medias = await api.medias.getLatestMedias.query();

  return (
    <div className="flex w-full flex-col gap-6">
      <p className="text-2xl font-medium">Últimas obras adicionadas</p>
      <SwipeableLatestMedias medias={medias} />
    </div>
  );
};
