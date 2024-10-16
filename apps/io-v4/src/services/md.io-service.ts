import { db } from "@taiyomoe/db"
import { MdUtils } from "@taiyomoe/utils"
import { Manga } from "mangadex-full-api"
import { HttpError } from "~/utils/http-error"
import { logger } from "~/utils/logger"

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
    creatorId,
    synopsis: MdUtils.getSynopsis(input),
    status: "RELEASING",
    source: "LIGHT_NOVEL",
    titles: titles.map((title) => ({
      ...title,
      creatorId,
    })),
    trackers: trackers.map((tracker) => ({
      ...tracker,
      creatorId,
    })),
  }
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
  getMedia,
  getCreationPayload,
  ensureValid,
}
