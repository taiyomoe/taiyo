import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares"
import { uploadCoverSchema } from "../schemas"
import { CoversService, MediasService } from "../services"
import { fileTypeValidator } from "../validators/fileType.validator"

const upload = new Elysia()
  .use(authMiddleware([["mediaCovers", "create"]]))
  .post(
    "/",
    async ({ body, session }) => {
      const media = await MediasService.getById(body.mediaId)
      const [uploadedFile] = await CoversService.upload(media.id, [body.file])
      const cover = await CoversService.insert(
        body,
        uploadedFile!,
        session.user.id,
      )

      return cover
    },
    {
      beforeHandle: fileTypeValidator,
      body: uploadCoverSchema,
    },
  )

export const coversController = new Elysia({ prefix: "/covers" }).use(upload)
