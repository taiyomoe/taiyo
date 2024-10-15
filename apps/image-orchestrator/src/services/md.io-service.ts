import type Stream from "@elysiajs/stream"
import {
  type Media,
  type MediaChapter,
  type MediaCover,
  type MediaTitle,
  type MediaTracker,
  type Prisma,
  db,
} from "@taiyomoe/db"
import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import { BaseTitlesService } from "@taiyomoe/services"
import { MdUtils, ObjectUtils, TitleUtils } from "@taiyomoe/utils"
import { type Chapter, type Cover, Group, Manga } from "mangadex-full-api"
import { isInt, parallel, pick } from "radash"
import {
  ChaptersService,
  CoversService,
  MediasService,
  ScansService,
  TrackersService,
} from "."
import type { ImportMediaInput, SyncMediaInput } from "../schemas"
import {
  DuplicatedMediaTrackerError,
  MediaNotFoundError,
  MediaTrackerNotFoundError,
} from "../utils/errors"
import { sendStream } from "../utils/streams"

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
  type: "imported" | "synced",
  s: ReturnType<typeof sendStream>,
  step: number,
  mediaId: string,
  mainCoverId: string,
  covers: Cover[],
  uploaderId: string,
) => {
  const uploadedCovers: MediaCover[] = []

  for (const [i, cover] of covers.entries()) {
    const coverLanguage = MdUtils.getLanguage(cover.locale)

    if (!coverLanguage) {
      continue
    }

    const _uploaded = await CoversService.uploadFromUrl(
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

    const result = await db.mediaCover.create({
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

    uploadedCovers.push(result)
  }

  await CoversService.postUpload(type, uploadedCovers)

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
  type: "imported" | "synced",
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

  for (const [i, chapter] of newChapters.entries()) {
    if (chapter.isExternal) {
      continue
    }

    s(currentStep, `Baixando o capítulo ${chapter.chapter}...`, "ongoing", i)

    const pagesUrls = await chapter.getReadablePages()
    const pages = await parallel(10, pagesUrls, (url) =>
      fetch(url).then((r) => r.blob()),
    )

    s(currentStep, `Upando o capítulo ${chapter.chapter}...`, "ongoing", i)

    const uploaded = await ChaptersService.upload(media.id, pages)

    await ChaptersService.insert(
      type,
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
        scanIds: chapter.groups
          .map((g) => groupToScan.get(g.id))
          .filter(Boolean),
        mediaId: media.id,
      },
      uploaded,
      uploaderId,
    )

    s(currentStep, `Capítulo ${chapter.chapter} upado`, "success", i)
  }

  if (newChapters.length) {
    s(currentStep, "Capítulos upados", "success")
  }
}

const postMediaUpdate = async (
  s: ReturnType<typeof sendStream>,
  step: number,
  oldMedia: Media,
  newMedia: Media,
  userId: string,
) => {
  s(step, "Atualizando a obra...", "ongoing")

  await MediasService.postUpdate("synced", oldMedia, newMedia, userId)

  s(step, "Obra atualizada", "success")
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
  const titles = await db.mediaTitle.findMany({
    where: { mediaId: media.id },
  })
  const trackers = await db.mediaTracker.findMany({
    where: { mediaId: media.id },
  })

  s(2, "Obra criada", "success")

  await uploadCovers(
    "imported",
    s,
    3,
    media.id,
    mainCover.id,
    covers,
    creatorId,
  )

  s(4, "Reindexando a busca...", "ongoing")

  await MediasService.postCreate("imported", media)
  await BaseTitlesService.postCreate("imported", titles)
  await TrackersService.postCreate("imported", trackers)

  s(4, "Busca reindexada", "success")

  if (!downloadChapters) {
    return
  }

  await uploadChapters("imported", s, 5, media, manga, [], creatorId)
}

const sync = async (
  stream: Stream<string | number | boolean | object>,
  { mediaId, downloadCovers, downloadChapters }: SyncMediaInput,
  creatorId: string,
) => {
  const s = sendStream(stream)
  const currentTrackers = await db.mediaTracker.findMany({
    where: { mediaId: mediaId },
  })
  const mdTracker = currentTrackers.find((t) => t.tracker === "MANGADEX")

  if (!mdTracker) {
    throw new MediaNotFoundError()
  }

  s(1, "Recuperando as informações da obra", "ongoing")

  const media = await MediasService.getById(mediaId)
  const currentChapters = await db.mediaChapter.findMany({
    where: { mediaId: mediaId, deletedAt: null },
  })
  const currentTitles = await db.mediaTitle.findMany({
    where: { mediaId: mediaId, deletedAt: null },
  })
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

  const result = await db.media.update({
    data: infoPayload.data,
    where: { id: mediaId },
  })

  await db.$transaction(async (tx) => {
    for (const [i, title] of deltaTitlesWithPriorities.entries()) {
      if (!("id" in title)) continue

      await tx.mediaTitle.update({
        data: { priority: 1000 + i },
        where: { id: title.id },
      })
    }

    const createdTitles: MediaTitle[] = []

    for (const title of deltaTitlesWithPriorities) {
      if ("id" in title) {
        const currentTitle = currentTitles.find((t) => t.id === title.id)!

        if (
          Object.keys(ObjectUtils.deepDiff(currentTitle, title)).length === 0
        ) {
          continue
        }

        const result = await tx.mediaTitle.update({
          data: pick(title, [
            "title",
            "language",
            "priority",
            "isAcronym",
            "isMainTitle",
          ]),
          where: { id: title.id },
        })

        await BaseTitlesService.postUpdate(
          "synced",
          currentTitle,
          result,
          creatorId,
        )

        continue
      }

      const result = await tx.mediaTitle.create({
        data: { ...title, mediaId, creatorId },
      })

      createdTitles.push(result)
    }

    await BaseTitlesService.postCreate("synced", createdTitles)
  })

  const createdTrackers: MediaTracker[] = []

  for (const tracker of infoPayload.trackers) {
    const existingTracker = currentTrackers.find(
      (t) => t.externalId === tracker.externalId,
    )

    if (existingTracker) {
      const result = await db.mediaTracker.update({
        data: tracker,
        where: { id: existingTracker.id },
      })

      await TrackersService.postUpdate(
        "synced",
        existingTracker,
        result,
        creatorId,
      )

      continue
    }

    const result = await db.mediaTracker.create({
      data: { ...tracker, mediaId },
    })

    createdTrackers.push(result)
  }
  await TrackersService.postCreate("synced", createdTrackers)

  s(2, "Obra atualizada", "ongoing")

  if (!downloadCovers && !downloadChapters) {
    await postMediaUpdate(s, 3, media, result, creatorId)

    return
  }

  let currentStep = 3

  if (downloadCovers) {
    s(currentStep, "Recuperando as covers...", "ongoing")

    const currentCovers = await db.mediaCover.findMany({
      where: { mediaId: mediaId, deletedAt: null },
    })
    const covers = await manga.getCovers()

    s(currentStep, "Covers recuperadas", "success")

    currentStep++

    const newCovers = covers
      .filter((c) => isInt(c.volume))
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
        "synced",
        s,
        currentStep,
        media.id,
        mainCover.id,
        newCovers,
        creatorId,
      )
    }

    currentStep++
  }

  await postMediaUpdate(s, currentStep, media, result, creatorId)

  if (!downloadChapters) {
    return
  }

  currentStep++

  await uploadChapters(
    "synced",
    s,
    currentStep,
    media,
    manga,
    currentChapters,
    creatorId,
  )
}

export const MdService = {
  getById,
  import: importFn,
  sync,
}
