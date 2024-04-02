import type { UpdateMediaInput } from "@taiyomoe/schemas"
import type { MediaWithRelations } from "@taiyomoe/types"
import { UpdateMediaForm } from "~/components/forms/medias/update/update-media-form"

type Props = {
  media: MediaWithRelations
}

export const UpdateMediaInfoTab = ({ media }: Props) => {
  const mdTracker = media.trackers.find((t) => t.tracker === "MANGADEX")
  const alTracker = media.trackers.find((t) => t.tracker === "ANILIST")
  const malTracker = media.trackers.find((t) => t.tracker === "MYANIMELIST")

  const initialValues: UpdateMediaInput = {
    id: media.id,
    startDate: media.startDate,
    endDate: media.endDate,
    synopsis: media.synopsis,
    contentRating: media.contentRating,
    oneShot: media.oneShot,
    type: media.type,
    status: media.status,
    source: media.source,
    demography: media.demography,
    countryOfOrigin: media.countryOfOrigin,
    flag: media.flag,
    genres: media.genres,
    tags: media.tags,
    mdId: mdTracker?.externalId ?? "",
    alId: alTracker ? Number.parseInt(alTracker.externalId) : 0,
    malId: malTracker ? Number.parseInt(malTracker.externalId) : 0,
  }

  return <UpdateMediaForm initialValues={initialValues} />
}
