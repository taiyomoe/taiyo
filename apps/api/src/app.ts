import { Scalar } from "@scalar/hono-api-reference"
import { config } from "@taiyomoe/config"
import { evlog } from "evlog/hono"
import { createHyperDXDrain } from "evlog/hyperdx"
import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import { cors } from "hono/cors"
import { createMiddleware } from "hono/factory"
import { secureHeaders } from "hono/secure-headers"
import type {
  AppContext,
  AppContextVariables,
  JsonResponse,
  PaginatedEnvelope,
  SuccessEnvelope,
} from "./middlewares/context-middleware"
import type { Services } from "./services"
import packageJson from "../package.json"
import { corsAllowedOrigins, env } from "./env"
import { bannersRouter } from "./routers/banners-router"
import { chaptersRouter } from "./routers/chapters-router"
import { coversRouter } from "./routers/covers-router"
import { dashboardRouter } from "./routers/dashboard-router"
import { groupsRouter } from "./routers/groups-router"
import { listsRouter } from "./routers/lists-router"
import { mediasRouter } from "./routers/medias-router"
import { ownershipRequestsRouter } from "./routers/ownership-requests-router"
import { staffsRouter } from "./routers/staffs-router"
import { usersRouter } from "./routers/users-router"
import { type ErrorCode, errors } from "./utils/errors"

declare module "hono" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Context extends AppContext {}
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface ContextVariableMap extends AppContextVariables {}
}

const hyperdxEndpoint = env.HYPERDX_ENDPOINT ?? ""
const hyperdxIngestionKey = env.HYPERDX_INGESTION_KEY ?? ""

export const createApp = (services: Services) => {
  const app = new Hono()
    .use(
      evlog(
        (process.env.TEST ?? "") !== "" || hyperdxEndpoint === "" || hyperdxIngestionKey === ""
          ? {}
          : {
              drain: createHyperDXDrain({
                endpoint: hyperdxEndpoint,
                apiKey: hyperdxIngestionKey,
              }),
            },
      ),
    )
    .use(secureHeaders())
    .use(
      cors({
        origin: corsAllowedOrigins.length > 0 ? corsAllowedOrigins : [],
        credentials: corsAllowedOrigins.length > 0,
        allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "Cookie"],
        maxAge: 600,
      }),
    )
    .use(
      createMiddleware(async (c, next) => {
        const timestamp = new Date().toISOString()
        const logRequestId = c.get("log").getContext().requestId
        const requestId =
          typeof logRequestId === "string" && logRequestId !== ""
            ? logRequestId
            : crypto.randomUUID()

        c.set("db", services.db)
        c.set("s3", services.s3)
        c.set("s3Bucket", services.s3Bucket)
        c.set("meili", services.meili)
        c.set("mediasIndex", services.mediasIndex)
        c.set("auth", services.auth)
        c.set("chapterUploadQueue", services.chapterUploadQueue)
        c.set("cacheNamespace", services.cacheNamespace)

        function ok<T>(data: T): JsonResponse<SuccessEnvelope<T>, 200 | 201>
        function ok<T, M extends Record<string, unknown>>(
          data: T,
          meta: M,
        ): JsonResponse<PaginatedEnvelope<T, M>, 200 | 201>
        function ok(data: unknown, meta?: Record<string, unknown>) {
          c.status(c.req.method === "POST" ? 201 : 200)

          return c.json({
            success: true,
            data,
            ...(meta !== undefined ? { meta } : {}),
            timestamp,
            requestId,
          })
        }

        c.ok = ok

        c.fail = (errorCode: ErrorCode, details?: unknown) => {
          const error = errors[errorCode]

          c.status(error.code)

          const response: {
            success: false
            message: string
            code: ErrorCode
            timestamp: string
            requestId: string
            details?: unknown
          } = {
            success: false,
            code: errorCode,
            message: error.message,
            timestamp,
            requestId,
          }

          if (details !== undefined) {
            response.details = details
          }

          return c.json(response)
        }

        await next()
      }),
    )
    .notFound((c) => c.fail("NOT_FOUND"))
    .onError((err, c) => {
      c.get("log").error(err)

      return c.fail(
        "INTERNAL_SERVER_ERROR",
        process.env.NODE_ENV === "production"
          ? undefined
          : { error: err.message, stack: err.stack },
      )
    })
    .on(["GET", "POST"], "/api/auth/*", (c) => services.auth.handler(c.req.raw))
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
    .route("/dashboard", dashboardRouter)

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
              name: "Settings",
              description:
                "Preferences of the signed-in user, stored on their account so every device shares them.",
            },
            {
              name: "Custom lists",
              description:
                "User-created reading lists. Each list is owned by one user, has a PUBLIC or PRIVATE visibility, and contains an ordered set of medias.",
            },
            {
              name: "Dashboard",
              description:
                "Admin dashboard data for moderators and admins: activity metrics, reading breakdowns and pending moderation work.",
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

export type AppType = ReturnType<typeof createApp>
