import type Stream from "@elysiajs/stream"
import { type Prisma, db } from "@taiyomoe/db"
import {
  MediasIndexService,
  ScansIndexService,
} from "@taiyomoe/meilisearch/services"
import { MdUtils, TitleUtils } from "@taiyomoe/utils"
import { Group, Manga } from "mangadex-full-api"
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

const getById = async (id: string) => {
  const result = await db.mediaTracker.findFirst({
    where: { externalId: id, tracker: "MANGADEX" },
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

  for (const [i, cover] of covers.entries()) {
    const coverLanguage = MdUtils.getLanguage(cover.locale)

    if (!coverLanguage) {
      continue
    }

    const _uploaded = await MediaCoversService.uploadFromUrl(
      media.id,
      cover.imageSource,
      {
        onDownloadStart: () =>
          s(3, `Baixando a cover ${i + 1}/${covers.length}...`, "ongoing", i),
        onUploadStart: () =>
          s(3, `Upando a cover ${i + 1}/${covers.length}...`, "ongoing", i),
        onUploadEnd: () =>
          s(3, `Cover ${i + 1}/${covers.length} upada`, "success", i),
      },
    )

    await db.mediaCover.create({
      data: {
        id: _uploaded.id,
        volume: Number.isNaN(cover.volume)
          ? null
          : Number.parseFloat(cover.volume),
        isMainCover: mainCover.id === cover.id,
        language: coverLanguage,
        mediaId: media.id,
        uploaderId: creatorId,
      },
    })
  }

  s(3, "Covers upadas", "success")
  s(4, "Reindexando a busca...", "ongoing")

  await MediasIndexService.sync(db, [media.id])

  s(4, "Busca reindexada", "success")

  if (!downloadChapters) {
    return
  }

  s(5, "Recuperando os capítulos...", "ongoing")

  const chapters = await manga.getFeed({
    // biome-ignore lint/style/useNumberNamespace: Number.Infinity is not allowed
    limit: Infinity,
    translatedLanguage: ["pt-br"],
    order: { chapter: "asc" },
  })

  s(5, "Capítulos recuperados", "success")
  s(6, "Recuperando as scans de todos os capítulos...", "ongoing")

  const groupsIds = [
    ...new Set(
      chapters.flatMap((chapter) => chapter.groups.flatMap((g) => g.id)),
    ),
  ]
  const groups = await Group.getMultiple(...groupsIds)
  const groupToScan = new Map<string, string>()

  s(6, "Scans recuperadas", "success")

  for (const [i, group] of groups.entries()) {
    const result = await db.scan.findFirst({ where: { name: group.name } })

    if (result) {
      continue
    }

    s(7, `Criando a scan '${group.name}'...`, "ongoing", i)

    const scan = await db.scan.create({
      data: {
        name: group.name,
        description: group.description,
        website: group.website,
        discord: group.discord,
        twitter: group.twitter,
        email: group.contactEmail,
        creatorId,
      },
    })

    groupToScan.set(group.id, scan.id)

    s(7, `Scan '${group.name}' criada`, "success", i)
  }

  if (groupToScan.size) {
    s(7, "Scans criadas", "success")
    s(8, "Reindexando a busca das scans...", "ongoing")

    await ScansIndexService.sync(db, Array.from(groupToScan.values()))

    s(8, "Busca das scans reindexada", "success")
  }

  for (const [i, chapter] of chapters.entries()) {
    s(9, `Baixando o capítulo ${chapter.chapter}...`, "ongoing", i)

    const pagesUrls = await chapter.getReadablePages()
    const pages = await parallel(10, pagesUrls, (url) =>
      fetch(url).then((r) => r.blob()),
    )

    s(9, `Upando o capítulo ${chapter.chapter}...`, "ongoing", i)

    const uploaded = await MediaChaptersService.upload(media.id, pages)

    await MediaChaptersService.insert(
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
      creatorId,
    )

    s(9, `Capítulo ${chapter.chapter} upado`, "success", i)
  }

  if (chapters.length) {
    s(9, "Capítulos upados", "success")
  }
}

const sync = async (
  stream: Stream<string | number | boolean | object>,
  { id }: SyncMediaInput,
  creatorId: string,
) => {
  const s = sendStream(stream)
  const _media = await MediasService.getById(id)
  const currentTitles = await MediaTitlesService.getAll(id)
  const currentTrackers = await MediaTrackersService.getAll(id)
  const mdTracker = currentTrackers.find((t) => t.tracker === "MANGADEX")

  if (!mdTracker) {
    throw new MediaNotFoundError()
  }

  s(1, "Recuperando as informações da obra", "ongoing")

  const manga = await Manga.get(mdTracker.externalId)

  s(1, "Informações recuperadas", "success")

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
}

export const MdService = {
  getById,
  import: importFn,
  sync,
}
