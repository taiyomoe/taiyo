import { MediaService } from "@taiyomoe/services"
import { FeaturedMediasCarousel } from "./featured-medias-carousel"

export const FeaturedMediasCategory = async () => {
  const medias = await MediaService.getFeaturedMedias()

  return <FeaturedMediasCarousel medias={medias} />
}
