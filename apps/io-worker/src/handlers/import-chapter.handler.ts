import { db } from "@taiyomoe/db"
import { BaseChaptersService } from "@taiyomoe/services"
import type { ImportChapterMessageInput } from "@taiyomoe/types"
import { Chapter } from "mangadex-full-api"
import { omit, parallel } from "radash"
import { FilesService } from "~/services/files.worker-service"
import { ScansService } from "~/services/scans.worker-service"

export const importChapterHandler = async (
  input: ImportChapterMessageInput,
) => {
  const pageUrls = await new Chapter(input.mdId).getReadablePages()
  const pageBuffers = await parallel(5, pageUrls, FilesService.download)
  const pageFiles = await parallel(10, pageBuffers, (b) =>
    FilesService.upload(`medias/${input.mediaId}/chapters`, b),
  )
  const scanIds = await ScansService.ensureGroups(
    input.groupIds,
    input.uploaderId,
  )
  const chapter = await db.mediaChapter.create({
    data: {
      ...omit(input, ["mdId", "groupIds"]),
      language: "pt_br",
      flag: "OK",
      pages: pageFiles,
      scans: { connect: scanIds.map((id) => ({ id })) },
    },
  })

  await BaseChaptersService.postUpload(db, "imported", [chapter])
}
