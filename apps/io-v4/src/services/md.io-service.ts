import { type Media, type Prisma, db } from "@taiyomoe/db"
import { rabbitPublisher } from "@taiyomoe/rabbit"
import { MdUtils } from "@taiyomoe/utils"
import { type Chapter, type Cover, Manga } from "mangadex-full-api"
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

const parseChapter = (input: Chapter) => {
  const volume = Number.parseInt(input.volume)

  if (volume.toString() !== input.volume) {
    logger.warn(
      `MangaDex chapter volume (stringified) didn't match the number one. It was probably a float. This happened when importing MangaDex media ${input.manga.id}`,
      input,
    )
  }

  return {
    mdId: input.id,
    title: input.title,
    number: Number.parseInt(input.chapter),
    volume,
    groupIds: input.groups.map((g) => g.id),
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
    synopsis: input.localizedDescription.data["pt-br"]
      ? input.localizedDescription.data["pt-br"]
      : original.synopsis,
  } satisfies Prisma.MediaUpdateInput
}

const getChapters = async (input: Manga) => {
  const result = await input.getFeed({
    // biome-ignore lint/style/useNumberNamespace: Number.Infinity is not allowed
    limit: Infinity,
    translatedLanguage: ["pt-br"],
    order: { chapter: "asc" },
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
    throw new HttpError(409, "medias.alreadyExists")
  }

  return true
}

const importCovers = async (input: Manga, media: Media, uploaderId: string) => {
  const covers = await input.getCovers()
  logger.debug(
    `Got ${covers.length} covers from MangaDex media ${input.id}`,
    covers,
  )

  for (const cover of covers) {
    const parsedCover = {
      ...parseCover(cover),
      contentRating: media.contentRating,
      mediaId: media.id,
      uploaderId,
    }

    await rabbitPublisher.medias.importCover(parsedCover)
    logger.debug(
      `Sent cover ${cover.id} to RabbitMQ queue when importing/syncing MangaDex media ${input.id}`,
      parsedCover,
    )
  }
}

const importChapters = async (
  input: Manga,
  media: Media,
  uploaderId: string,
) => {
  const chapters = await getChapters(input)
  logger.debug(
    `Got ${chapters.length} chapters from MangaDex media ${input.id}`,
    chapters,
  )

  for (const chapter of chapters) {
    if (chapter.isExternal) {
      logger.debug(
        `Skipped external chapter when importing/syncing MangaDex media ${input.id}`,
        chapter,
      )
      continue
    }

    const parsedChapter = {
      ...parseChapter(chapter),
      contentRating: media.contentRating,
      mediaId: media.id,
      uploaderId,
    }

    await rabbitPublisher.medias.importChapter(parsedChapter)
    logger.debug(
      `Sent chapter ${chapter.id} to RabbitMQ queue when importing/syncing MangaDex media ${input.id}`,
      parsedChapter,
    )
  }
}

export const MdService = {
  parseCover,
  parseChapter,
  getMedia,
  getCreationPayload,
  getUpdatePayload,
  getChapters,
  ensureValid,
  importCovers,
  importChapters,
}
