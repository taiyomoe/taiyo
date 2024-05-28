import { MediaService } from "@taiyomoe/services"
import { TrendingMediasCarousel } from "./trending-medias-carousel"

export const TrendingMediasCategory = async () => {
  const medias = await MediaService.getLatestMedias()

  return (
    <div className="sticky top-24 flex h-fit min-w-[300px] flex-col gap-6">
      <p className="font-medium text-2xl">Em alta</p>
      <TrendingMediasCarousel medias={medias} />
    </div>
  )
}
