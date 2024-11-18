import type { Prisma } from "@taiyomoe/db"
import { MdUtils } from "@taiyomoe/utils"
import type { Chapter, Cover, Manga } from "mangadex-full-api"
import { logger } from "~/utils/logger"

const parseCover = (input: Cover) => {
  const volume = input.volume ? Number.parseFloat(input.volume) : null
  let language = MdUtils.getLanguage(input.locale)

  if (volume && volume.toString() !== input.volume) {
    logger.warn(
      `MangaDex cover volume (stringified) didn't match the number one. It was probably a decimal volume. This happened when importing MangaDex media ${input.manga.id}`,
      input,
    )
  }

  if (!language) {
    language = "en"
    logger.error(
      `Failed to get cover language when importing MangaDex media ${input.manga.id}. Defaulting to "en"`,
      input,
    )
  }

  return {
    url: input.url,
    volume,
    language,
  }
}

const parseChapter = (input: Chapter) => {
  const volume = input.volume ? Number.parseFloat(input.volume) : null
  const number = input.chapter ? Number.parseFloat(input.chapter) : 0

  if (volume && volume.toString() !== input.volume) {
    logger.warn(
      `MangaDex chapter volume (stringified) didn't match the number one. It was probably a float. This happened when importing MangaDex media ${input.manga.id}`,
      input,
    )
  }

  return {
    title: input.title,
    number,
    volume,
    groupIds: input.groups.map((g) => g.id),
  }
}

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
  parseCover,
  parseChapter,
  getCreationPayload,
}
