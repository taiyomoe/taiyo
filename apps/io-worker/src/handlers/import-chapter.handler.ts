// import { randomUUID } from "crypto"
// import { db } from "@taiyomoe/db"
// import { BaseChaptersService, BaseFilesService } from "@taiyomoe/services"
// import type { ImportChapterMessageInput } from "@taiyomoe/types"
// import { Chapter } from "mangadex-full-api"
// import { parallel, pick } from "radash"
// import { GroupsService } from "~/services/groups.worker-service"
// import { logger } from "~/utils/logger"

// export const importChapterHandler = async (
//   input: ImportChapterMessageInput,
// ) => {
//   const chapterId = randomUUID()
//   const rawChapter = await Chapter.get(input.mdId)
//   const pageUrls = await rawChapter.getReadablePages()
//   const pageBuffers = await parallel(5, pageUrls, BaseFilesService.download)

//   await db.task.update({
//     data: { status: "UPLOADING" },
//     where: { id: input.taskId },
//   })

//   const uploadedPages = await parallel(10, pageBuffers, (b) =>
//     BaseFilesService.upload(`medias/${input.mediaId}/chapters/${chapterId}`, b),
//   )
//   const groupIds = await GroupsService.ensureGroups(
//     input.groupIds,
//     input.uploaderId,
//   )
//   const chapter = await db.chapter.create({
//     data: {
//       ...pick(input, [
//         "title",
//         "number",
//         "volume",
//         "contentRating",
//         "mediaId",
//         "uploaderId",
//       ]),
//       id: chapterId,
//       language: "pt_br",
//       flag: "OK",
//       pages: uploadedPages,
//       groups: { connect: groupIds.map((id) => ({ id })) },
//     },
//   })

//   await BaseChaptersService.postUpload(db, "imported", [chapter])

//   logger.info(`${input.uploaderId} imported a chapter`, chapter.id)

//   return chapter
// }
