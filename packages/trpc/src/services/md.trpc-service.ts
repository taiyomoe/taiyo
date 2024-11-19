import { type Media, type Prisma, db } from "@taiyomoe/db"
import { MdUtils } from "@taiyomoe/utils"
import { Manga } from "mangadex-full-api"
import { logger } from "../utils/logger"
import { HttpError } from "../utils/trpc-error"

const getMedia = async (input: string) => {
  const result = await Manga.get(input).catch(() => null)

  if (!result) {
    throw new HttpError("NOT_FOUND", "md.notFound")
  }

  return result
}

const getUpdatePayload = (input: Manga, original: Media) => {
  const { genres, tags, isOneShot } = MdUtils.getGenresAndTags(input)
  const startDate = input.year
    ? new Date(Date.parse(input.year.toString()))
    : null

  return {
    startDate:
      startDate?.getFullYear() === original.startDate?.getFullYear()
        ? original.startDate
        : startDate,
    contentRating: MdUtils.getContentRating(input),
    oneShot: isOneShot,
    type: MdUtils.getType(input),
    demography: MdUtils.getDemography(input),
    countryOfOrigin: MdUtils.getCountryOfOrigin(input),
    genres,
    tags: tags.map((key) => ({ key, isSpoiler: false })),
    synopsis: input.description["pt-br"]
      ? input.description["pt-br"]
      : original.synopsis,
  } satisfies Prisma.MediaUpdateInput
}

const getChapters = async (input: Manga) => {
  const result = await input.getFeed({
    // biome-ignore lint/style/useNumberNamespace: Number.Infinity is not allowed
    limit: Infinity,
    translatedLanguage: ["pt-br"],
    order: { chapter: "asc" },
    contentRating: ["safe", "suggestive", "erotica", "pornographic"],
  })

  return result
}

const ensureValid = async (input: string) => {
  const result = await db.mediaTracker.findFirst({
    where: { externalId: input, media: { deletedAt: null } },
    select: { id: true },
  })

  if (result) {
    logger.debug(`Media ${input} already exists in the database`)
    throw new HttpError("CONFLICT", "medias.alreadyExists")
  }

  return true
}

export const MdService = {
  getMedia,
  getUpdatePayload,
  getChapters,
  ensureValid,
}
