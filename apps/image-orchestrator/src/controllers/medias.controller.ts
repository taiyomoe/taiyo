import { db } from "@taiyomoe/db"
import { BaseTitlesService } from "@taiyomoe/services"
import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares"
import { createMediaSchema } from "../schemas"
import { CoversService, MediasService, TrackersService } from "../services"

const create = new Elysia().use(authMiddleware([["medias", "create"]])).post(
  "/",
  async ({ body, session }) => {
    await TrackersService.has(body)

    const result = await db.$transaction(async (client) => {
      const result = await MediasService.create(client, body, session.user.id)
      const [uploadedFile] = await CoversService.upload(result.id, [body.cover])

      await CoversService.insertLimited(
        uploadedFile!,
        result.id,
        session.user.id,
        client,
      )

      return result
    })

    const titles = await db.mediaTitle.findMany({
      where: { mediaId: result.id },
    })
    const trackers = await db.mediaTracker.findMany({
      where: { mediaId: result.id },
    })

    await MediasService.postCreate(db, "created", result)
    await BaseTitlesService.postCreate(db, "created", titles)
    await TrackersService.postCreate("created", trackers)

    return result
  },
  { body: createMediaSchema },
)

export const mediasController = new Elysia({ prefix: "/medias" }).use(create)
