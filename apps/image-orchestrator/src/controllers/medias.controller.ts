import { Stream } from "@elysiajs/stream"
import { db } from "@taiyomoe/db"
import {
  MediasService as BaseMediasService,
  TitlesService,
} from "@taiyomoe/services"
import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares"
import {
  createMediaSchema,
  importMediaSchema,
  syncMediaSchema,
} from "../schemas"
import {
  CoversService,
  MdService,
  MediasService,
  TrackersService,
} from "../services"
import { handleStreamErrors } from "../utils/streams"

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

    await BaseMediasService.postCreate("created", result)
    await TitlesService.postCreate("created", titles)
    await TrackersService.postCreate("created", trackers)

    return result
  },
  { body: createMediaSchema },
)

const importRoute = new Elysia()
  .use(authMiddleware([["medias", "create"]]))
  .get(
    "/import",
    ({ query, session }) =>
      new Stream(async (stream) => {
        await MdService.import(stream, query, session.user.id).catch(
          handleStreamErrors(stream),
        )

        stream.close()
      }),
    { query: importMediaSchema },
  )

const sync = new Elysia().use(authMiddleware([["medias", "create"]])).get(
  "/sync",
  ({ query, session }) =>
    new Stream(async (stream) => {
      await MdService.sync(stream, query, session.user.id).catch(
        handleStreamErrors(stream),
      )

      stream.close()
    }),
  { query: syncMediaSchema },
)

export const mediasController = new Elysia({ prefix: "/medias" })
  .use(create)
  .use(importRoute)
  .use(sync)
