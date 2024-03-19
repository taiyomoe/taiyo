import { Elysia } from "elysia"
import { authMiddleware } from "~/middlewares/auth.middleware"
import { CreateCoverInput } from "~/schemas"
import { MediaCoversService } from "~/services/mediaCovers.service"
import { MediasService } from "~/services/medias.service"
import { fileTypeValidator } from "~/validators/fileType.validator"

const upload = new Elysia()
  .use(authMiddleware([["mediaCovers", "create"]]))
  .post(
    "/upload",
    async ({ body, session }) => {
      const media = await MediasService.getById(body.mediaId)
      const [uploadedFile] = await MediaCoversService.upload(media.id, [
        body.file,
      ])
      const cover = await MediaCoversService.insert(
        body,
        uploadedFile!,
        session.user.id,
      )

      return cover
    },
    {
      beforeHandle: fileTypeValidator,
      body: CreateCoverInput,
    },
  )

export const coversController = new Elysia({ prefix: "/covers" }).use(upload)
