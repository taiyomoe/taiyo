// import { db } from "@taiyomoe/db"
// import { BaseChaptersService, BaseFilesService } from "@taiyomoe/services"
// import type { UploadChapterMessageInput } from "@taiyomoe/types"
// import { parallel, pick } from "radash"
// import { logger } from "~/utils/logger"

// export const uploadChapterHandler = async (
//   input: UploadChapterMessageInput,
// ) => {
//   const pages = await parallel(10, input.pages, BaseFilesService.downloadFromS3)
//   const uploadedPages = await parallel(10, pages, async (p) =>
//     BaseFilesService.upload(`medias/${input.mediaId}/chapters/${input.id}`, p),
//   )
//   const chapter = await db.chapter.create({
//     data: {
//       ...pick(input, [
//         "title",
//         "number",
//         "volume",
//         "contentRating",
//         "flag",
//         "language",
//         "mediaId",
//         "uploaderId",
//       ]),
//       id: input.id,
//       groups: { connect: input.groupIds.map((s) => ({ id: s })) },
//       pages: uploadedPages,
//     },
//   })

//   await BaseChaptersService.postUpload(db, "imported", [chapter])

//   logger.info(`${input.uploaderId} uploaded a chapter`, chapter.id)

//   return chapter
// }
