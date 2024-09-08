import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares"
import { uploadBannerSchema } from "../schemas"
import { MediaBannersService, MediasService } from "../services"
import { fileTypeValidator } from "../validators/fileType.validator"

const upload = new Elysia()
  .use(authMiddleware([["mediaBanners", "create"]]))
  .post(
    "/",
    async ({ body, session }) => {
      const media = await MediasService.getById(body.mediaId)
      const [uploadedFile] = await MediaBannersService.upload(media.id, [
        body.file,
      ])
      const banner = await MediaBannersService.insert(
        body,
        uploadedFile!,
        session.user.id,
      )

      return banner
    },
    {
      beforeHandle: fileTypeValidator,
      body: uploadBannerSchema,
    },
  )

export const bannersController = new Elysia({ prefix: "/banners" }).use(upload)
