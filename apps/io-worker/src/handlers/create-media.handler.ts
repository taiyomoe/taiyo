import { type Prisma, db } from "@taiyomoe/db"
import {
  BaseCoversService,
  BaseMediasService,
  BaseTitlesService,
  BaseTrackersService,
} from "@taiyomoe/services"
import type { CreateMediaMessageInput } from "@taiyomoe/types"
import { pick } from "radash"
import SuperJSON from "superjson"
import { FilesService } from "~/services/files.worker-service"

export const createMediaHandler = async (
  payload: CreateMediaMessageInput,
  reply: (content: string) => void,
) => {
  const result = await db.$transaction(async (tx) => {
    const media = await tx.media.create({
      data: {
        ...pick(payload, [
          "startDate",
          "endDate",
          "synopsis",
          "contentRating",
          "oneShot",
          "type",
          "status",
          "source",
          "demography",
          "countryOfOrigin",
          "genres",
          "tags",
          "flag",
          "creatorId",
        ]),
        titles: {
          create: {
            title: payload.mainTitle,
            language: payload.mainTitleLanguage,
            isMainTitle: true,
            priority: 1,
            creatorId: payload.creatorId,
          },
        },
        trackers: {
          createMany: {
            data: [
              {
                tracker: "MANGADEX",
                externalId: payload.mdId,
                creatorId: payload.creatorId,
              },
              {
                tracker: "ANILIST",
                externalId: payload.alId?.toString(),
                creatorId: payload.creatorId,
              },
              {
                tracker: "MYANIMELIST",
                externalId: payload.malId?.toString(),
                creatorId: payload.creatorId,
              },
            ].filter(
              (t) => t.externalId !== undefined,
            ) as Prisma.MediaTrackerCreateManyMediaInput[],
          },
        },
      },
    })
    const coverBuffer = Buffer.from(payload.mainCover)
    const coverFile = await FilesService.upload(
      `medias/${media.id}/covers`,
      coverBuffer,
    )
    const cover = await tx.mediaCover.create({
      data: {
        id: coverFile.id,
        language: payload.mainCoverLanguage,
        volume: payload.mainCoverVolume,
        contentRating: payload.mainCoverContentRating,
        isMainCover: true,
        mediaId: media.id,
        uploaderId: payload.creatorId,
      },
    })
    const titles = await tx.mediaTitle.findMany({
      where: { mediaId: media.id },
    })
    const trackers = await tx.mediaTracker.findMany({
      where: { mediaId: media.id },
    })

    await BaseMediasService.postCreate(tx, "created", media)
    await BaseTitlesService.postCreate(tx, "created", titles)
    await BaseTrackersService.postCreate("created", trackers)
    await BaseCoversService.postUpload(tx, "created", [cover])

    return media
  })

  return reply(SuperJSON.stringify(result))
}
