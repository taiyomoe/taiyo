import { randomUUID } from "crypto"
import { db } from "@taiyomoe/db"
import {
  BaseCoversService,
  BaseFilesService,
  BaseMediasService,
  BaseTitlesService,
  BaseTrackersService,
} from "@taiyomoe/services"
import type { ImportMediaMessageInput } from "@taiyomoe/types"
import { MdUtils } from "@taiyomoe/utils"
import { Manga } from "mangadex-full-api"
import { MdService } from "~/services/md.worker-service"
import { logger } from "~/utils/logger"

export const importMediaHandler = async ({
  mdId,
  creatorId,
}: ImportMediaMessageInput) => {
  const manga = await Manga.get(mdId)
  const rawMainCover = await manga.mainCover.resolve()
  const mainCover = MdUtils.parseCover(rawMainCover, logger)
  const payload = MdService.getCreationPayload(manga, creatorId)

  logger.debug(`Parsed payload from MangaDex media ${mdId}`, payload)

  const mediaId = randomUUID()
  const coverBuffer = await BaseFilesService.download(mainCover.url)
  const coverFile = await BaseFilesService.upload(
    `medias/${mediaId}/covers`,
    coverBuffer,
  )
  const media = await db.media.create({
    data: {
      ...payload,
      id: mediaId,
      covers: {
        create: {
          id: coverFile.id,
          volume: mainCover.volume,
          language: mainCover.language,
          contentRating: payload.contentRating,
          isMainCover: true,
          uploaderId: creatorId,
        },
      },
    },
  })
  const covers = await db.mediaCover.findMany({
    where: { mediaId: media.id },
  })
  const titles = await db.mediaTitle.findMany({
    where: { mediaId: media.id },
  })
  const trackers = await db.mediaTracker.findMany({
    where: { mediaId: media.id },
  })

  await BaseMediasService.postCreate(db, "imported", media)
  await BaseTitlesService.postCreate(db, "imported", titles)
  await BaseTrackersService.postCreate("imported", trackers)
  await BaseCoversService.postUpload(db, "imported", covers)

  logger.info(`${creatorId} imported a media`, media.id)

  return media
}
