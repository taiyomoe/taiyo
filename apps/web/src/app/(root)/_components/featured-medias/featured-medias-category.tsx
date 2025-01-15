import { MediasService } from "~/services/medias.web-service"
import { getSession } from "~/utils/get-session"
import { FeaturedMediasCarousel } from "./featured-medias-carousel"

export const FeaturedMediasCategory = async () => {
  const session = await getSession()
  const medias = await MediasService.getFeatured(
    session?.user.settings.preferredTitles,
  )

  return <FeaturedMediasCarousel medias={medias} />
}
