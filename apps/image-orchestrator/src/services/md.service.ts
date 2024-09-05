import type Stream from "@elysiajs/stream"
import { type Scan, db } from "@taiyomoe/db"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import {
  getMediaIndexItem,
  getScanIndexItem,
} from "@taiyomoe/meilisearch/utils"
import { MdUtils } from "@taiyomoe/utils"
import { Group, Manga } from "mangadex-full-api"
import { parallel } from "radash"
import type { ImportMediaInput } from "../schemas"
import {
  DuplicatedMediaTrackerError,
  MediaTrackerNotFoundError,
} from "../utils/errors"
import { sendStream } from "../utils/streams"
import { MediaChaptersService } from "./mediaChapters.service"
import { MediaCoversService } from "./mediaCovers.service"
import { MediasService } from "./medias.service"

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

  const { genres, tags, isOneShot } = MdUtils.getGenresAndTags(manga)
  const titles = MdUtils.getTitles(manga)
  const trackers = MdUtils.getTrackers(manga)

  const media = await db.media.create({
    data: {
      startDate: manga.year
        ? new Date(Date.parse(manga.year.toString()))
        : null,
      // -----
      synopsis: "Under construction...",
      contentRating: MdUtils.getContentRating(manga),
      oneShot: isOneShot,
      type: MdUtils.getType(manga),
      status: "RELEASING",
      source: "LIGHT_NOVEL",
      demography: MdUtils.getDemography(manga),
      countryOfOrigin: MdUtils.getCountryOfOrigin(manga),
      genres,
      tags: tags.map((key) => ({ key, isSpoiler: false })),
      // -----
      titles: {
        create: titles.map((title) => ({
          ...title,
          creatorId,
        })),
      },
      trackers: {
        create: trackers.map((tracker) => ({
          ...tracker,
          creatorId,
        })),
      },
      // -----
      creatorId,
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

  const mediaIndexItem = await getMediaIndexItem(db, media.id)
  await meilisearchClient.medias.updateDocuments([mediaIndexItem])

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
  const scans: Scan[] = []

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

    scans.push(scan)

    s(7, `Scan '${group.name}' criada`, "success", i)
  }

  if (scans.length) {
    s(7, "Scans criadas", "success")
    s(8, "Reindexando a busca das scans...", "ongoing")

    const scansIndexItems = await parallel(10, scans, ({ id }) =>
      getScanIndexItem(db, id),
    )
    await meilisearchClient.scans.updateDocuments(scansIndexItems)

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
        scanIds: scans.map((s) => s.id),
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

export const MdService = {
  getById,
  import: importFn,
}
