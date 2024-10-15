import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares"
import { uploadChapterSchema } from "../schemas"
import { ChaptersService, MediasService, ScansService } from "../services"
import { fileTypeValidator } from "../validators/fileType.validator"

const upload = new Elysia()
  .use(authMiddleware([["mediaChapters", "create"]]))
  .post(
    "/",
    async ({ body, session }) => {
      const media = await MediasService.getById(body.mediaId)

      await ScansService.getByIds(body.scanIds ?? [])

      const uploadedChapter = await ChaptersService.upload(media.id, body.files)
      const chapter = await ChaptersService.insert(
        "created",
        body,
        uploadedChapter,
        session.user.id,
      )

      return chapter
    },
    {
      beforeHandle: fileTypeValidator,
      body: uploadChapterSchema,
    },
  )

export const chaptersController = new Elysia({ prefix: "/chapters" }).use(
  upload,
)
