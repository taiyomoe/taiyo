import { db } from "@taiyomoe/db"
import {
  BaseCoversService,
  BaseMediasService,
  BaseTitlesService,
  BaseTrackersService,
} from "@taiyomoe/services"
import type { ImportMediaInitialMessageInput } from "@taiyomoe/types"
import SuperJSON from "superjson"
import { FilesService } from "~/services/files.worker-service"

export const mediasInitialImportHandler = async (
  { payload, mainCoverPayload }: ImportMediaInitialMessageInput,
  reply: (content: string) => void,
) => {
  const result = await db.$transaction(async (tx) => {
    const media = await tx.media.create({ data: payload })
    const titles = await tx.mediaTitle.findMany({
      where: { mediaId: media.id },
    })
    const trackers = await tx.mediaTracker.findMany({
      where: { mediaId: media.id },
    })
    const mainCoverBuffer = await FilesService.download(mainCoverPayload.url)
    const mainCoverFile = await FilesService.upload(
      `medias/${media.id}/covers`,
      mainCoverBuffer,
    )
    const mainCover = await tx.mediaCover.create({
      data: {
        id: mainCoverFile.id,
        volume: mainCoverPayload.volume,
        language: mainCoverPayload.language,
        contentRating: media.contentRating,
        isMainCover: true,
        mediaId: media.id,
        uploaderId: media.creatorId,
      },
    })

    await BaseMediasService.postCreate(tx, "imported", media)
    await BaseTitlesService.postCreate(tx, "imported", titles)
    await BaseTrackersService.postCreate("imported", trackers)
    await BaseCoversService.postUpload(tx, "imported", [mainCover])

    return media
  })

  reply(SuperJSON.stringify(result))
}
