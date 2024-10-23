import { type Media, type Prisma, db } from "@taiyomoe/db"
const parseCover = (input: Cover) => {
  const volume = Number.parseFloat(input.volume)
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
  const volume = Number.parseFloat(input.volume)

  if (volume.toString() !== input.volume) {
    logger.warn(
      `MangaDex chapter volume (stringified) didn't match the number one. It was probably a float. This happened when importing MangaDex media ${input.manga.id}`,
      input,
    )
  }

  return {
    mdId: input.id,
    title: input.title,
    number: Number.parseFloat(input.chapter),
    volume,
    groupIds: input.groups.map((g) => g.id),
  }
}

const getMedia = async (input: string) => {
  const result = await Manga.get(input).catch(() => null)

  if (!result) {
    throw new HttpError("NOT_FOUND", "md.notFound")
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
    throw new HttpError("CONFLICT", "medias.alreadyExists")
  }

  return true
}

export const MdService = {
  parseCover,
  parseChapter,
  getMedia,
  getCreationPayload,
  getUpdatePayload,
  getChapters,
  ensureValid,
}
