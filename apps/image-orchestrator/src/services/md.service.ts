import type Stream from "@elysiajs/stream"
import { type Media, type MediaChapter, type Prisma, db } from "@taiyomoe/db"
import {
  ChaptersIndexService,
  MediasIndexService,
  ScansIndexService,
} from "@taiyomoe/meilisearch/services"
import { MdUtils, TitleUtils } from "@taiyomoe/utils"
import { type Chapter, type Cover, Group, Manga } from "mangadex-full-api"
import { parallel } from "radash"
import type { ImportMediaInput, SyncMediaInput } from "../schemas"
import {
  DuplicatedMediaTrackerError,
  MediaNotFoundError,
  MediaTrackerNotFoundError,
} from "../utils/errors"
import { sendStream } from "../utils/streams"
import {
  MediaChaptersService,
  MediaCoversService,
  MediaTitlesService,
  MediaTrackersService,
  MediasService,
  ScansService,
} from "./"

const getInfoPayload = <TAction extends "create" | "update">(
  action: TAction,
  manga: Manga,
  creatorId: string,
) => {
  const { genres, tags, isOneShot } = MdUtils.getGenresAndTags(manga)
  const titles = MdUtils.getTitles(manga)
  const trackers = MdUtils.getTrackers(manga)
  const staticData = {
    synopsis: "Under construction...",
    status: "RELEASING",
    source: "LIGHT_NOVEL",
  }

  const data = {
    startDate: manga.year ? new Date(Date.parse(manga.year.toString())) : null,
    // -----
    contentRating: MdUtils.getContentRating(manga),
    oneShot: isOneShot,
    type: MdUtils.getType(manga),
    demography: MdUtils.getDemography(manga),
    countryOfOrigin: MdUtils.getCountryOfOrigin(manga),
    genres,
    tags: tags.map((key) => ({ key, isSpoiler: false })),
    creatorId,
    ...(action === "create" ? staticData : {}),
  } as unknown as TAction extends "create"
    ? Prisma.MediaCreateInput
    : Prisma.MediaUpdateInput

  return {
    data,
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

const uploadCovers = async (
  s: ReturnType<typeof sendStream>,
  step: number,
  mediaId: string,
  mainCoverId: string,
  covers: Cover[],
  uploaderId: string,
) => {
  for (const [i, cover] of covers.entries()) {
    const coverLanguage = MdUtils.getLanguage(cover.locale)

    if (!coverLanguage) {
      continue
    }

    const _uploaded = await MediaCoversService.uploadFromUrl(
      mediaId,
      cover.imageSource,
      {
        onDownloadStart: () =>
          s(
            step,
            `Baixando a cover ${i + 1}/${covers.length}...`,
            "ongoing",
            i,
          ),
        onUploadStart: () =>
          s(step, `Upando a cover ${i + 1}/${covers.length}...`, "ongoing", i),
        onUploadEnd: () =>
          s(step, `Cover ${i + 1}/${covers.length} upada`, "success", i),
      },
    )

    await db.mediaCover.create({
      data: {
        id: _uploaded.id,
        volume: Number.isNaN(cover.volume)
          ? null
          : Number.parseFloat(cover.volume),
        isMainCover: mainCoverId === cover.id,
        language: coverLanguage,
        mediaId,
        uploaderId,
      },
    })
  }

  s(step, "Covers upadas", "success")
}

const createScans = async (
  s: ReturnType<typeof sendStream>,
  step: number,
  chapters: Chapter[],
  creatorId: string,
) => {
  let currentStep = step

  s(currentStep, "Recuperando as scans de todos os capítulos...", "ongoing")

  const groupsIds = [
    ...new Set(
      chapters.flatMap((chapter) => chapter.groups.flatMap((g) => g.id)),
    ),
  ]
  const groups = await Group.getMultiple(...groupsIds)
  const groupToScan = new Map<string, string>()

  s(currentStep, "Scans recuperadas", "success")

  currentStep++

  for (const [i, group] of groups.entries()) {
    const result = await ScansService.getByName(group.name).catch(() => null)

    if (result) {
      continue
    }

    s(currentStep, `Criando a scan '${group.name}'...`, "ongoing", i)

    const scan = await ScansService.insert(group, creatorId)

    groupToScan.set(group.id, scan.id)

    s(currentStep, `Scan '${group.name}' criada`, "success", i)
  }

  if (groupToScan.size) {
    s(currentStep, "Scans criadas", "success")

    currentStep++

    s(currentStep, "Reindexando a busca das scans...", "ongoing")

    await ScansIndexService.sync(db, Array.from(groupToScan.values()))

    s(currentStep, "Busca das scans reindexada", "success")
  }

  for (const group of groups) {
    if (groupToScan.has(group.id)) continue

    const scan = await ScansService.getByName(group.name)

    groupToScan.set(group.id, scan.id)
  }

  return groupToScan
}

const uploadChapters = async (
  s: ReturnType<typeof sendStream>,
  step: number,
  media: Media,
  manga: Manga,
  existingChapters: MediaChapter[],
  uploaderId: string,
) => {
  let currentStep = step

  s(step, "Recuperando os capítulos...", "ongoing")

  const chapters = await manga.getFeed({
    // biome-ignore lint/style/useNumberNamespace: Number.Infinity is not allowed
    limit: Infinity,
    translatedLanguage: ["pt-br"],
    order: { chapter: "asc" },
  })

  s(step, "Capítulos recuperados", "success")

  currentStep++

  const groupToScan = await createScans(s, currentStep, chapters, uploaderId)

  currentStep += 3

  const newChapters = chapters
    .map((c) =>
      existingChapters.find((cc) => cc.number === Number(c.chapter)) ? null : c,
    )
    .filter(Boolean)
  const uploadedChapters = []

  for (const [i, chapter] of newChapters.entries()) {
    s(currentStep, `Baixando o capítulo ${chapter.chapter}...`, "ongoing", i)

    const pagesUrls = await chapter.getReadablePages()
    const pages = await parallel(10, pagesUrls, (url) =>
      fetch(url).then((r) => r.blob()),
    )

    s(currentStep, `Upando o capítulo ${chapter.chapter}...`, "ongoing", i)

    const uploaded = await MediaChaptersService.upload(media.id, pages)
    const uploadedChapter = await MediaChaptersService.insert(
      {
        title: chapter.title,
        number: Number(chapter.chapter),
        volume: Number.isNaN(chapter.volume)
          ? undefined
          : Number.parseFloat(chapter.volume),
        contentRating: media.contentRating,
        language: "pt_br",
        flag: "OK",
        files: [],
        scanIds: chapter.groups.map((g) => groupToScan.get(g.id)!),
        mediaId: media.id,
      },
      uploaded,
      uploaderId,
    )

    uploadedChapters.push(uploadedChapter)

    s(currentStep, `Capítulo ${chapter.chapter} upado`, "success", i)
  }

  if (chapters.length) {
    s(currentStep, "Capítulos upados", "success")
  }
}

const syncMediasIndex = async (
  s: ReturnType<typeof sendStream>,
  step: number,
  mediaId: string,
) => {
  s(step, "Reindexando a busca...", "ongoing")

  await MediasIndexService.sync(db, [mediaId])

  s(step, "Busca reindexada", "success")
}

const getById = async (id: string) => {
  const result = await db.mediaTracker.findFirst({
    where: { externalId: id, tracker: "MANGADEX", media: { deletedAt: null } },
  })

  if (!result) {
    throw new MediaTrackerNotFoundError()
  }

  return await MediasService.getById(result.mediaId)
}

const importFn = async (
  stream: Stream<string | number | boolean | object>,
  { mdId, downloadChapters }: ImportMediaInput,
  creatorId: string,
) => {
  const s = sendStream(stream)
  const existingMedia = await getById(mdId).catch(() => null)

  if (existingMedia) {
    throw new DuplicatedMediaTrackerError(existingMedia.id, "MANGADEX")
  }

  s(1, "Recuperando as informações da obra", "ongoing")

  const manga = await Manga.get(mdId)
  const covers = await manga.getCovers()
  const mainCover = await manga.mainCover.resolve()

  s(1, "Informações recuperadas", "success")
  s(2, "Criando a obra...", "ongoing")

  const infoPayload = getInfoPayload("create", manga, creatorId)
  const media = await db.media.create({
    data: {
      ...infoPayload.data,
      titles: { create: infoPayload.titles },
      trackers: { create: infoPayload.trackers },
    },
  })

  s(2, "Obra criada", "success")

  await uploadCovers(s, 3, media.id, mainCover.id, covers, creatorId)
  await syncMediasIndex(s, 4, media.id)

  if (!downloadChapters) {
    return
  }

  await uploadChapters(s, 5, media, manga, [], creatorId)
}

const sync = async (
  stream: Stream<string | number | boolean | object>,
  { id, downloadCovers, downloadChapters }: SyncMediaInput,
  creatorId: string,
) => {
  const s = sendStream(stream)
  const currentTrackers = await MediaTrackersService.getAll(id)
  const mdTracker = currentTrackers.find((t) => t.tracker === "MANGADEX")

  if (!mdTracker) {
    throw new MediaNotFoundError()
  }

  s(1, "Recuperando as informações da obra", "ongoing")

  const media = await MediasService.getById(id)
  const currentChapters = await MediaChaptersService.getAll(id)
  const currentTitles = await MediaTitlesService.getAll(id)
  const manga = await Manga.get(mdTracker.externalId)
  const mainCover = await manga.mainCover.resolve()

  s(1, "Informações recuperadas", "success")
  s(2, "Atualizando a obra...", "ongoing")

  const infoPayload = getInfoPayload("update", manga, creatorId)
  const newTitles = MdUtils.getTitles(manga)
  const deltaTitles = TitleUtils.computeDelta(currentTitles, newTitles)
  const deltaTitlesWithPriorities = TitleUtils.computePriorities(
    currentTitles,
    deltaTitles,
  )

  await db.media.update({
    data: infoPayload.data,
    where: { id },
  })

  for (const title of deltaTitlesWithPriorities) {
    await db.mediaTitle.upsert({
      create: { ...title, mediaId: id, creatorId },
      update: title,
      where: { id: "id" in title ? title.id : "" },
    })
  }

  for (const tracker of infoPayload.trackers) {
    const existingTracker = currentTrackers.find(
      (t) => t.externalId === tracker.externalId,
    )

    await db.mediaTracker.upsert({
      create: { ...tracker, mediaId: id },
      update: tracker,
      where: { id: existingTracker?.id ?? "" },
    })
  }

  s(2, "Obra atualizada", "ongoing")

  if (!downloadCovers && !downloadChapters) {
    await syncMediasIndex(s, 3, media.id)

    return
  }

  let currentStep = 3

  if (downloadCovers) {
    s(currentStep, "Recuperando as covers...", "ongoing")

    const currentCovers = await MediaCoversService.getAll(id)
    const covers = await manga.getCovers()

    s(currentStep, "Covers recuperadas", "success")

    currentStep++

    const newCovers = covers
      .map((c) =>
        currentCovers.find(
          (cc) => cc.language === c.locale && cc.volume === Number(c.volume),
        )
          ? null
          : c,
      )
      .filter(Boolean)

    if (newCovers.length > 0) {
      await uploadCovers(
        s,
        currentStep,
        media.id,
        mainCover.id,
        covers,
        creatorId,
      )

      currentStep++
    }
  }

  await syncMediasIndex(s, currentStep, media.id)

  if (!downloadChapters) {
    return
  }

  await uploadChapters(s, currentStep, media, manga, currentChapters, creatorId)
}

export const MdService = {
  getById,
  import: importFn,
  sync,
}
