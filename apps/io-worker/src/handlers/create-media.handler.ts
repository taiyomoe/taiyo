// import type { TaskStatus } from "@prisma/client"
// import { db } from "@taiyomoe/db"
// import {
//   BaseCoversService,
//   BaseFilesService,
//   BaseMediasService,
//   BaseTitlesService,
//   BaseTrackersService,
// } from "@taiyomoe/services"
// import type { CreateMediaMessageInput } from "@taiyomoe/types"
// import { pick } from "radash"
// import { logger } from "~/utils/logger"

// export const createMediaHandler = async (input: CreateMediaMessageInput) => {
//   const mainCover = await BaseFilesService.downloadFromS3(input.mainCover)
//   const uploadedMainCover = await BaseFilesService.upload(
//     `medias/${input.id}/covers`,
//     mainCover,
//   )
//   const media = await db.media.create({
//     data: {
//       ...pick(input, [
//         "startDate",
//         "endDate",
//         "synopsis",
//         "contentRating",
//         "oneShot",
//         "type",
//         "status",
//         "source",
//         "demography",
//         "countryOfOrigin",
//         "genres",
//         "tags",
//         "flag",
//         "creatorId",
//       ]),
//       id: input.id,
//       covers: {
//         create: {
//           id: uploadedMainCover.id,
//           language: input.mainCoverLanguage,
//           volume: input.mainCoverVolume,
//           contentRating: input.mainCoverContentRating,
//           isMainCover: true,
//           uploaderId: input.creatorId,
//         },
//       },
//       titles: {
//         create: {
//           title: input.mainTitle,
//           language: input.mainTitleLanguage,
//           isMainTitle: true,
//           priority: 1,
//           creatorId: input.creatorId,
//         },
//       },
//       trackers: {
//         createMany: {
//           data: [
//             {
//               tracker: "MANGADEX",
//               externalId: input.mdId,
//               creatorId: input.creatorId,
//             },
//             {
//               tracker: "ANILIST",
//               externalId: input.alId?.toString(),
//               creatorId: input.creatorId,
//             },
//             {
//               tracker: "MYANIMELIST",
//               externalId: input.malId?.toString(),
//               creatorId: input.creatorId,
//             },
//           ].filter(
//             (t) => t.externalId !== undefined,
//           ) as Prisma.MediaTrackerCreateManyMediaInput[],
//         },
//       },
//     },
//   })
//   const covers = await db.cover.findMany({
//     where: { mediaId: media.id },
//   })
//   const titles = await db.title.findMany({
//     where: { mediaId: media.id },
//   })
//   const trackers = await db.tracker.findMany({
//     where: { mediaId: media.id },
//   })

//   await BaseMediasService.postCreate(db, "created", media)
//   await BaseCoversService.postUpload(db, "created", covers)
//   await BaseTitlesService.postCreate(db, "created", titles)
//   await BaseTrackersService.postCreate("created", trackers)

//   logger.info(`${input.creatorId} created a media`, media.id)

//   return media
// }
