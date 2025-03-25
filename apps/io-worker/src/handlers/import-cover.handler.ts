// import { db } from "@taiyomoe/db"
// import { BaseCoversService, BaseFilesService } from "@taiyomoe/services"
// import type { ImportCoverMessageInput } from "@taiyomoe/types"
// import { pick } from "radash"
// import { logger } from "~/utils/logger"

// export const importCoverHandler = async (input: ImportCoverMessageInput) => {
//   const coverBuffer = await BaseFilesService.download(input.url)

//   await db.task.update({
//     data: { status: "UPLOADING" },
//     where: { id: input.taskId },
//   })

//   const uploadedCover = await BaseFilesService.upload(
//     `medias/${input.mediaId}/covers`,
//     coverBuffer,
//   )
//   const cover = await db.cover.create({
//     data: {
//       ...pick(input, [
//         "contentRating",
//         "volume",
//         "language",
//         "mediaId",
//         "uploaderId",
//       ]),
//       id: uploadedCover.id,
//     },
//   })

//   await BaseCoversService.postUpload(db, "imported", [cover])

//   logger.info(`${input.uploaderId} imported a cover`, cover.id)

//   return cover
// }
