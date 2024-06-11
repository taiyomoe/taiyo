import { MediaService } from "@taiyomoe/services"
import { FeaturedMediasCarousel } from "./featured-medias-carousel"

export const FeaturedMediasCategory = async () => {
  const medias = await MediaService.getFeatured()

  return <FeaturedMediasCarousel medias={medias} />
}
