import { Elysia } from "elysia"
import { authMiddleware } from "~/middlewares/auth.middleware"
import { CreateChapterInput } from "~/schemas"
import { MediaChaptersService, MediasService } from "~/services"
import { ScansService } from "~/services/scans.service"
import { fileTypeValidator } from "~/validators/fileType.validator"

const upload = new Elysia()
  .use(authMiddleware([["mediaChapters", "create"]]))
  .post(
    "/upload",
    async ({ body, session }) => {
      const media = await MediasService.getById(body.mediaId)

      await ScansService.getByIds(body.scanIds)

      const uploadedChapter = await MediaChaptersService.upload(
        media.id,
        body.files,
      )
      const chapter = await MediaChaptersService.insert(
        body,
        uploadedChapter,
        session.user.id,
      )

      return chapter
    },
    {
      beforeHandle: fileTypeValidator,
      body: CreateChapterInput,
    },
  )

export const chaptersController = new Elysia({ prefix: "/chapters" }).use(
  upload,
)
