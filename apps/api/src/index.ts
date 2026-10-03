import { serve } from "@hono/node-server"
import { Scalar } from "@scalar/hono-api-reference"
import { config } from "@taiyomoe/config"
import { evlog } from "evlog/hono"
import { createHyperDXDrain } from "evlog/hyperdx"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { openAPIRouteHandler } from "hono-openapi"
import packageJson from "../package.json"
import { env } from "./env"
import {
  type AppContext,
  AppContextVariables,
  createContextMiddleware,
} from "./middlewares/context-middleware"
import { errorHandler } from "./middlewares/error-handler-middleware"
import { bannersRouter } from "./routers/banners-router"
import { chaptersRouter } from "./routers/chapters-router"
import { coversRouter } from "./routers/covers-router"
import { groupsRouter } from "./routers/groups-router"
import { listsRouter } from "./routers/lists-router"
import { mediasRouter } from "./routers/medias-router"
import { ownershipRequestsRouter } from "./routers/ownership-requests-router"
import { staffsRouter } from "./routers/staffs-router"
import { usersRouter } from "./routers/users-router"
import { createServices, type Services } from "./services"

declare module "hono" {
  interface Context extends AppContext {}
  interface ContextVariableMap extends AppContextVariables {}
}

const corsOrigins = (env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

export const createApp = (services: Services) => {
  const app = new Hono()
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
    .use(secureHeaders())
    .use(
      cors({
        origin: corsOrigins.length > 0 ? corsOrigins : [],
        credentials: corsOrigins.length > 0,
        allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "Cookie"],
        maxAge: 600,
      }),
    )
    .use(createContextMiddleware(services))
    .notFound((c) => c.fail("NOT_FOUND"))
    .onError(errorHandler)
    .on(["GET", "POST"], "/api/auth/**", (c) => services.auth.handler(c.req.raw))
    .get("/ping", (c) => c.json({ version: packageJson.version }))
    .route("/medias", mediasRouter)
    .route("/covers", coversRouter)
    .route("/banners", bannersRouter)
    .route("/staffs", staffsRouter)
    .route("/chapters", chaptersRouter)
    .route("/groups", groupsRouter)
    .route("/ownership-requests", ownershipRequestsRouter)
    .route("/users", usersRouter)
    .route("/lists", listsRouter)

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
            {
              name: "Covers",
              description:
                "Cover images attached to a media. List and create are scoped under the parent media; get/update/delete/set-main operate on the cover by its own id.",
            },
            {
              name: "Banners",
              description:
                "Banner images attached to a media. List and create are scoped under the parent media; get/update/delete operate on the banner by its own id.",
            },
            {
              name: "Staffs",
              description:
                "Authors, artists and other staff members. Top-level resource referenced by medias via `mediaStaffs`.",
            },
            {
              name: "Chapters",
              description:
                "Chapters of a media. List and create are scoped under the parent media; get/update/delete operate on the chapter by its own id.",
            },
            {
              name: "Media staff",
              description:
                "Links between a media and the staff members credited on it. Each link carries a role (AUTHOR / ARTIST).",
            },
            {
              name: "Groups",
              description:
                "Translation / scanlation groups. Top-level resource that can be linked to chapters via `chapterGroups`.",
            },
            {
              name: "Chapter groups",
              description: "Links between a chapter and the groups that worked on it.",
            },
            {
              name: "Group ownership",
              description:
                "Workflow for users to claim ownership of a group: request, approval, rejection, cancellation.",
            },
            {
              name: "Group members",
              description:
                "Managing the membership of a group: list, add, remove, promote/demote, leave.",
            },
            {
              name: "Follows",
              description:
                "Following relationships between users. Each follow is a one-directional edge (A → B); reciprocity is two edges.",
            },
            {
              name: "Reading history",
              description: "Per-chapter reading-progress records, scoped to the signed-in user.",
            },
            {
              name: "Library",
              description:
                "Per-user library — manga the user is reading / has read / etc., scoped to the signed-in user.",
            },
            {
              name: "Custom lists",
              description:
                "User-created reading lists. Each list is owned by one user, has a PUBLIC or PRIVATE visibility, and contains an ordered set of medias.",
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

  return app
}

if (!process.env.TEST) {
  const app = createApp(createServices())

  serve({ fetch: app.fetch, port: 3002 }, ({ port }) => {
    // oxlint-disable-next-line no-console
    console.debug(`Server is running on http://localhost:${port}`)
  })
}
