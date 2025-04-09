import type { Prisma } from "@prisma/client"
import type { Manga } from "mangadex-full-api"
import { MdUtils } from "~/utils/md.utils"

const getCreationPayload = (input: Manga, creatorId: string) => {
  const { genres, tags, isOneShot } = MdUtils.getGenresAndTags(input)
  const titles = MdUtils.getTitles(input)
  const trackers = MdUtils.getTrackers(input)

  return {
    startDate: input.year ? new Date(Date.parse(input.year.toString())) : null,
    contentRating: MdUtils.getContentRating(input),
    oneShot: isOneShot,
    type: MdUtils.getType(input),
    demography: MdUtils.getDemography(input),
    countryOfOrigin: MdUtils.getCountryOfOrigin(input),
    genres,
    tags: tags.map((key) => ({ key, isSpoiler: false })),
    synopsis: MdUtils.getSynopsis(input),
    status: "RELEASING",
    source: "LIGHT_NOVEL",
    creator: { connect: { id: creatorId } },
    titles: {
      createMany: { data: titles.map((t) => ({ ...t, creatorId })) },
    },
    trackers: {
      createMany: { data: trackers.map((t) => ({ ...t, creatorId })) },
    },
  } satisfies Prisma.MediaCreateInput
}

export const MdService = {
  getCreationPayload,
}
