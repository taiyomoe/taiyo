import type Stream from "@elysiajs/stream"
import { type Scan, db } from "@taiyomoe/db"
import { meilisearchIndexes } from "@taiyomoe/meilisearch"
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
import { MediaChaptersService } from "./mediaChapters.service"
import { MediaCoversService } from "./mediaCovers.service"
import { MediasService } from "./medias.service"

const getById = async (id: string) => {
  const result = await db.mediaTracker.findUnique({ where: { id } })

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
  const existingMedia = await getById(mdId).catch(() => null)

  if (existingMedia) {
    throw new DuplicatedMediaTrackerError(existingMedia.id, "MANGADEX")
  }

  stream.send({
    step: 1,
    content: "Recuperando as informações da obra...",
    type: "ongoing",
  })

  const manga = await Manga.get(mdId)
  const covers = await manga.getCovers()
  const mainCover = await manga.mainCover.resolve()

  stream.send({
    step: 1,
    content: "Informações recuperadas",
    type: "success",
  })

  stream.send({
    step: 2,
    content: "Criando a obra...",
    type: "ongoing",
  })

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

  stream.send({
    step: 2,
    content: "Obra criada",
    type: "success",
  })

  for (const [i, cover] of covers.entries()) {
    const coverLanguage = MdUtils.getLanguage(cover.locale)

    if (!coverLanguage) {
      continue
    }

    const _uploaded = await MediaCoversService.uploadFromUrl(
      media.id,
      cover.imageSource,
      {
        onDownloadStart: () => {
          stream.send({
            step: 3,
            content: `Baixando a cover ${i + 1}/${covers.length}...`,
            type: "ongoing",
          })
        },
        onUploadStart: () => {
          stream.send({
            step: 3,
            content: `Upando a cover ${i + 1}/${covers.length}...`,
            type: "ongoing",
          })
        },
        onUploadEnd: () => {
          stream.send({
            step: 3,
            content: `Cover ${i + 1}/${covers.length} upada`,
            type: "success",
          })
        },
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

  stream.send({
    step: 3,
    content: "Covers upadas",
    type: "success",
  })

  stream.send({
    step: 4,
    content: "Reindexando a busca...",
    type: "ongoing",
  })

  const mediaIndexItem = await getMediaIndexItem(db, media.id)
  await meilisearchIndexes.medias.updateDocuments([mediaIndexItem])

  stream.send({
    step: 4,
    content: "Busca reindexada",
    type: "success",
  })

  if (!downloadChapters) {
    return
  }

  stream.send({
    step: 5,
    content: "Recuperando os capítulos...",
    type: "ongoing",
  })

  const chapters = await manga.getFeed({
    // biome-ignore lint/style/useNumberNamespace: Number.Infinity is not allowed
    limit: Infinity,
    translatedLanguage: ["pt-br"],
    order: { chapter: "asc" },
  })

  stream.send({
    step: 5,
    content: "Capítulos recuperados",
    type: "success",
  })

  stream.send({
    step: 6,
    content: "Recuperando as scans de todos os capítulos...",
    type: "ongoing",
  })

  const groupsIds = [
    ...new Set(
      chapters.flatMap((chapter) => chapter.groups.flatMap((g) => g.id)),
    ),
  ]
  const groups = await Group.getMultiple(...groupsIds)
  const scans: Scan[] = []

  for (const group of groups) {
    const result = await db.scan.findFirst({ where: { name: group.name } })

    if (result) {
      continue
    }

    stream.send({
      step: 6,
      content: `Criando a scan '${group.name}'...`,
      type: "ongoing",
    })

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

    stream.send({
      step: 6,
      content: `Scan '${group.name}' criada`,
      type: "success",
    })
  }

  if (scans.length) {
    stream.send({
      step: 7,
      content: "Reindexando a busca das scans...",
      type: "ongoing",
    })

    const scansIndexItems = await parallel(10, scans, ({ id }) =>
      getScanIndexItem(db, id),
    )
    await meilisearchIndexes.scans.updateDocuments(scansIndexItems)

    stream.send({
      step: 7,
      content: "Busca das scans reindexada",
      type: "success",
    })
  }

  for (const chapter of chapters) {
    stream.send({
      step: 8,
      content: `Baixando o capítulo ${chapter.chapter}...`,
      type: "ongoing",
    })

    const pagesUrls = await chapter.getReadablePages()
    const pages = await parallel(10, pagesUrls, (url) =>
      fetch(url).then((r) => r.blob()),
    )

    stream.send({
      step: 8,
      content: `Upando o capítulo ${chapter.chapter}...`,
      type: "ongoing",
    })

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

    stream.send({
      step: 8,
      content: `Capítulo ${chapter.chapter} upado`,
      type: "success",
    })
  }

  if (chapters.length) {
    stream.send({
      step: 8,
      content: "Capítulos upados.",
      type: "success",
    })
  }
}

export const MdService = {
  getById,
  import: importFn,
}
