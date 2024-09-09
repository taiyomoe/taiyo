import { MediasService } from "@taiyomoe/services"
import { TrendingMediasCarousel } from "./trending-medias-carousel"

export const TrendingMediasCategory = async () => {
  const medias = await MediasService.getLatest()

  return (
    <div className="sticky top-24 flex h-fit min-w-[280px] flex-col gap-4 lg:min-w-[350px]">
      <p className="font-semibold text-2xl">Em alta</p>
      <TrendingMediasCarousel medias={medias} />
    </div>
  )
}
