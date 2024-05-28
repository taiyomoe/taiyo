import { MediaService } from "@taiyomoe/services"
import { LatestMediasCarousel } from "./latest-medias-carousel"

export const LatestMediasCategory = async () => {
  const medias = await MediaService.getLatestMedias()

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="font-semibold text-2xl">Últimas obras adicionadas</p>
      <LatestMediasCarousel medias={medias} />
    </div>
  )
}
