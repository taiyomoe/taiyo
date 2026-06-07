import { serve } from "@hono/node-server"
import { Scalar } from "@scalar/hono-api-reference"
import { auth } from "@taiyomoe/auth/server"
import { config } from "@taiyomoe/config"
import { evlog } from "evlog/hono"
import { createHyperDXDrain } from "evlog/hyperdx"
import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import packageJson from "../package.json"
import { env } from "./env"
import {
  type AppContext,
  AppContextVariables,
  contextMiddleware,
} from "./middlewares/context-middleware"
import { errorHandler } from "./middlewares/error-handler-middleware"
import { mediasRouter } from "./routers/medias-router"

declare module "hono" {
  interface Context extends AppContext {}
  interface ContextVariableMap extends AppContextVariables {}
}

export const app = new Hono()
  .use(
    evlog({
      drain: process.env.TEST
        ? undefined
        : createHyperDXDrain({
            endpoint: env.HYPERDX_ENDPOINT,
            apiKey: env.HYPERDX_INGESTION_KEY,
          }),
    }),
  )
  .use(contextMiddleware)
  .notFound((c) => c.fail("NOT_FOUND"))
  .onError(errorHandler)
  .on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw))
  .get("/ping", (c) => c.json({ version: packageJson.version }))
  .route("/medias", mediasRouter)

app
  .get(
    "/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: config.openapi.title,
          version: packageJson.version,
          description: config.openapi.description,
        },
        tags: [
          {
            name: "Medias",
            description:
              "Manga, manhwa, manhua, light novels and other long-form comics. These endpoints create and curate the entries themselves along with everything attached to them — titles, covers, banners, external links and staff credits.",
          },
        ],
      },
    }),
  )
  .get(
    "/docs",
    Scalar({
      theme: "deepSpace",
      url: "/openapi.json",
    }),
  )

if (!process.env.TEST) {
  serve({ fetch: app.fetch, port: 3002 }, ({ port }) => {
    // oxlint-disable-next-line no-console
    console.debug(`Server is running on http://localhost:${port}`)
  })
}
