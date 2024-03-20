import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import { db } from "@taiyomoe/db"
import { meilisearchIndexes } from "@taiyomoe/meilisearch"
import { getMediaIndexItem } from "@taiyomoe/meilisearch/utils"
import { MdUtils } from "@taiyomoe/utils"
import { Manga } from "mangadex-full-api"
import type { CoversService } from "~/routes/covers/covers.service"
import type { ImportMediaDto } from "~/routes/medias/dto/import-media.dto"
import type { MediasService } from "~/routes/medias/medias.service"
import type { PrismaService } from "./prisma.service"

@Injectable()
export class MdService {
  importEventKey = "medias.import"

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private mediasService: MediasService,
    private coversService: CoversService,
  ) {}

  async getById(id: string) {
    const result = await this.prisma.mediaTracker.findUnique({ where: { id } })

    if (!result) {
      throw new NotFoundException("Media tracker not found.")
    }

    return await this.mediasService.getById(result.mediaId)
  }

  async import({ mdId, synopsis }: ImportMediaDto, creatorId: string) {
    const existingMedia = await this.getById(mdId).catch(() => null)

    if (existingMedia) {
      throw new UnprocessableEntityException("Uma obra com esse ID da MangaDex já existe.")
    }

    this.eventEmitter.emit(this.importEventKey, {
      step: 1,
      content: "Recuperando as informações da obra...",
      type: "ongoing",
    })

    const manga = await Manga.get(mdId)
    const covers = await manga.getCovers()
    const _mainCover = await manga.mainCover.resolve()

    console.log("manga", manga)

    this.eventEmitter.emit(this.importEventKey, {
      step: 1,
      content: "Informações recuperadas",
      type: "success",
    })

    this.eventEmitter.emit(this.importEventKey, {
      step: 2,
      content: "Criando a obra...",
      type: "ongoing",
    })

    const { genres, tags, isOneShot } = MdUtils.getGenresAndTags(manga)
    const titles = MdUtils.getTitles(manga)
    const trackers = MdUtils.getTrackers(manga)

    const media = await this.prisma.media.create({
      data: {
        startDate: manga.year ? new Date(Date.parse(manga.year.toString())) : null,
        // -----
        synopsis,
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

    this.eventEmitter.emit(this.importEventKey, {
      step: 2,
      content: "Obra criada",
      type: "success",
    })

    for (const [i, cover] of covers.entries()) {
      const coverLanguage = MdUtils.getLanguage(cover.locale)

      if (!coverLanguage) {
        continue
      }

      const _uploaded = await this.coversService.uploadFromUrl(media.id, cover.imageSource, {
        onDownload: () => {
          this.eventEmitter.emit(this.importEventKey, {
            step: 3,
            content: `Baixando a cover ${i + 1}/${covers.length}...`,
            type: "ongoing",
          })
        },
        onUpload: () => {
          this.eventEmitter.emit(this.importEventKey, {
            step: 3,
            content: `Upando a cover ${i + 1}/${covers.length}...`,
            type: "success",
          })
        },
      })

      await db.mediaCover.create({
        data: {
          id: _uploaded.id,
          volume: Number.isNaN(cover.volume) ? null : Number.parseFloat(cover.volume),
          isMainCover: _mainCover.id === cover.id,
          language: coverLanguage,
          mediaId: media.id,
          uploaderId: creatorId,
        },
      })
    }

    this.eventEmitter.emit(this.importEventKey, {
      step: 3,
      content: "Covers upadas",
      type: "success",
    })

    this.eventEmitter.emit(this.importEventKey, {
      step: 4,
      content: "Reindexando a busca...",
      type: "ongoing",
    })

    const indexItem = await getMediaIndexItem(db, media.id)
    await meilisearchIndexes.medias.updateDocuments([indexItem])

    this.eventEmitter.emit(this.importEventKey, {
      step: 4,
      content: "Busca reindexada",
      type: "success",
    })
  }
}
