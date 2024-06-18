import { MediasService } from "@taiyomoe/services"
import { FeaturedMediasCarousel } from "./featured-medias-carousel"

export const FeaturedMediasCategory = async () => {
  const medias = await MediasService.getFeatured()

  return <FeaturedMediasCarousel medias={medias} />
}
