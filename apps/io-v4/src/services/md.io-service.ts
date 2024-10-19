import { type Prisma, db } from "@taiyomoe/db"
import { MdUtils } from "@taiyomoe/utils"
import { type Cover, Manga } from "mangadex-full-api"
import { HttpError } from "~/utils/http-error"
import { logger } from "~/utils/logger"

const parseCover = (input: Cover) => {
  const volume = Number.parseInt(input.volume)
  let language = MdUtils.getLanguage(input.locale)

  if (volume.toString() !== input.volume) {
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
    url: input.imageSource,
    volume,
    language,
  }
}

const getMedia = async (input: string) => {
  const result = await Manga.get(input).catch(() => null)

  if (!result) {
    throw new HttpError(404, "md.notFound")
  }

  return result
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

const ensureValid = async (input: string) => {
  const result = await db.mediaTracker.findFirst({
    where: { externalId: input },
    select: { id: true },
  })

  if (result) {
    logger.debug(`Media ${input} already exists in the database`)
    throw new HttpError(409, "medias.alreadyExists")
  }

  return true
}

export const MdService = {
  parseCover,
  getMedia,
  getCreationPayload,
  ensureValid,
}
