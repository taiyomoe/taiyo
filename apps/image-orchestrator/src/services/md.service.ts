import type Stream from "@elysiajs/stream"
import { db } from "@taiyomoe/db"
import { meilisearchIndexes } from "@taiyomoe/meilisearch"
import { getMediaIndexItem } from "@taiyomoe/meilisearch/utils"
import { MdUtils } from "@taiyomoe/utils"
import { Manga } from "mangadex-full-api"
import type { ImportMediaInput } from "~/schemas"
import { MediaCoversService } from "./mediaCovers.service"
import { MediasService } from "./medias.service"

const getById = async (id: string) => {
  const result = await db.mediaTracker.findUnique({ where: { id } })

  if (!result) {
    throw new Error("Media tracker not found.")
  }

  return await MediasService.getById(result.mediaId)
}

const importFn = async (
  stream: Stream<string | number | boolean | object>,
  { mdId }: ImportMediaInput,
  creatorId: string,
) => {
  const existingMedia = await getById(mdId).catch(() => null)

  if (existingMedia) {
    throw new Error("Uma obra com esse ID da MangaDex já existe.")
  }

  stream.send({
    step: 1,
    content: "Recuperando as informações da obra...",
    type: "ongoing",
  })

  const manga = await Manga.get(mdId)
  const covers = await manga.getCovers()
  const _mainCover = await manga.mainCover.resolve()

  console.log("manga", manga)

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
        onDownload: () => {
          stream.send({
            step: 3,
            content: `Baixando a cover ${i + 1}/${covers.length}...`,
            type: "ongoing",
          })
        },
        onUpload: () => {
          stream.send({
            step: 3,
            content: `Upando a cover ${i + 1}/${covers.length}...`,
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
        isMainCover: _mainCover.id === cover.id,
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

  const indexItem = await getMediaIndexItem(db, media.id)
  await meilisearchIndexes.medias.updateDocuments([indexItem])

  stream.send({
    step: 4,
    content: "Busca reindexada",
    type: "success",
  })
}

export const MdService = {
  getById,
  import: importFn,
}
