import { Stream } from "@elysiajs/stream"
import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares/auth.middleware"
import { ImportMediaInput } from "../schemas"
import { MdService } from "../services/md.service"

const importRoute = new Elysia()
  .use(authMiddleware([["medias", "create"]]))
  .get(
    "/import",
    ({ query, session }) =>
      new Stream(async (stream) => {
        await MdService.import(stream, query, session.user.id)

        stream.close()
      }),
    { query: ImportMediaInput },
  )

export const mediasController = new Elysia({ prefix: "/medias" }).use(
  importRoute,
)
