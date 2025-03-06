import type { HomeLayout } from "@taiyomoe/db"
import { MediasService } from "~/services/medias.web-service"
import { TrendingMediasCarousel } from "./trending-medias-carousel"

type Props = {
  initialLayout: HomeLayout
}

export const TrendingMediasCategory = async (props: Props) => {
  const medias = await MediasService.getLatest()

  return (
    <div className="sticky top-24 flex h-fit min-w-[280px] flex-col gap-4 lg:min-w-[350px]">
      <p className="font-semibold text-2xl">Em alta</p>
      <TrendingMediasCarousel medias={medias} {...props} />
    </div>
  )
}
