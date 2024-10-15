import { auth } from "@taiyomoe/auth"
import { MediasService } from "~/services/medias.web-service"
import { FeaturedMediasCarousel } from "./featured-medias-carousel"

export const FeaturedMediasCategory = async () => {
  const session = await auth()
  const medias = await MediasService.getFeatured(session?.user.preferredTitles)

  return <FeaturedMediasCarousel medias={medias} />
}
