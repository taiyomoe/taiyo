import { randomUUID } from "crypto"
import { db } from "@taiyomoe/db"
import { BaseChaptersService, BaseFilesService } from "@taiyomoe/services"
import type { ImportChapterMessageInput } from "@taiyomoe/types"
import { Chapter } from "mangadex-full-api"
import { omit, parallel } from "radash"
import { MdService } from "~/services/md.worker-service"
import { ScansService } from "~/services/scans.worker-service"
import { logger } from "~/utils/logger"

export const importChapterHandler = async (
  input: ImportChapterMessageInput,
) => {
  const chapterId = randomUUID()
  const rawChapter = await Chapter.get(input.mdId)
  const parsedChapter = MdService.parseChapter(rawChapter)
  const pageUrls = await rawChapter.getReadablePages()
  const pageBuffers = await parallel(5, pageUrls, BaseFilesService.download)

  await db.task.update({
    data: { status: "UPLOADING" },
    where: { id: input.taskId },
  })

  const uploadedPages = await parallel(10, pageBuffers, (b) =>
    BaseFilesService.upload(`medias/${input.mediaId}/chapters/${chapterId}`, b),
  )
  const scanIds = await ScansService.ensureGroups(
    parsedChapter.groupIds,
    input.uploaderId,
  )
  const chapter = await db.mediaChapter.create({
    data: {
      ...omit(parsedChapter, ["groupIds"]),
      id: chapterId,
      language: "pt_br",
      flag: "OK",
      pages: uploadedPages,
      scans: { connect: scanIds.map((id) => ({ id })) },
      mediaId: input.mediaId,
      uploaderId: input.uploaderId,
    },
  })

  await BaseChaptersService.postUpload(db, "imported", [chapter])

  logger.info(`${input.uploaderId} imported a chapter`, chapter.id)

  return chapter
}
