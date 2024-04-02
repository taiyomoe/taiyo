import { Stream } from "@elysiajs/stream"
import { db } from "@taiyomoe/db"
import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares/auth.middleware"
import { createMediaSchema, importMediaSchema } from "../schemas"
import {
  MdService,
  MediaCoversService,
  MediaTrackersService,
  MediasService,
} from "../services"

const create = new Elysia().use(authMiddleware([["medias", "create"]])).post(
  "/",
  async ({ body, session }) => {
    await MediaTrackersService.hasTrackers(body)

    const media = db.$transaction(async (client) => {
      const media = await MediasService.create(client, body, session.user.id)
      const [uploadedFile] = await MediaCoversService.upload(media.id, [
        body.cover,
      ])

      await MediaCoversService.insertLimited(
        uploadedFile!,
        media.id,
        session.user.id,
        client,
      )

      return media
    })

    return media
  },
  { body: createMediaSchema },
)

const importRoute = new Elysia()
  .use(authMiddleware([["medias", "create"]]))
  .get(
    "/import",
    ({ query, session }) =>
      new Stream(async (stream) => {
        await MdService.import(stream, query, session.user.id)

        stream.close()
      }),
    { query: importMediaSchema },
  )

export const mediasController = new Elysia({ prefix: "/medias" })
  .use(create)
  .use(importRoute)
