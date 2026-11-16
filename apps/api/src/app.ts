import { Scalar } from "@scalar/hono-api-reference"
import { createAuditLogDrain } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { auditRedactPreset, drainPlugin } from "evlog"
import { evlog } from "evlog/hono"
import { createHyperDXDrain } from "evlog/hyperdx"
import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import { bodyLimit } from "hono/body-limit"
import { cors } from "hono/cors"
import { createMiddleware } from "hono/factory"
import { NONCE, secureHeaders } from "hono/secure-headers"
import { readFile } from "node:fs/promises"
import type {
  AppContext,
  AppContextVariables,
  JsonResponse,
  PaginatedEnvelope,
  SuccessEnvelope,
} from "./middlewares/context-middleware"
import type { Services } from "./services"
import packageJson from "../../../package.json"
import { corsAllowedOrigins, env } from "./env"
import { ImageTooComplexError } from "./image-store"
import { auditAuthRequest } from "./middlewares/audit-auth-middleware"
import { checkOrigin } from "./middlewares/check-origin-middleware"
import { auditLogsRouter } from "./routers/audit-logs-router"
import { bannersRouter } from "./routers/banners-router"
import { chaptersRouter } from "./routers/chapters-router"
import { commentImagesRouter } from "./routers/comment-images-router"
import { commentReportsRouter } from "./routers/comment-reports-router"
import { commentsRouter } from "./routers/comments-router"
import { coversRouter } from "./routers/covers-router"
import { dashboardRouter } from "./routers/dashboard-router"
import { groupCreationRequestsRouter } from "./routers/group-creation-requests-router"
import { groupInvitationsRouter } from "./routers/group-invitations-router"
import { groupReportsRouter } from "./routers/group-reports-router"
import { groupsRouter } from "./routers/groups-router"
import { listsRouter } from "./routers/lists-router"
import { mangaDexSyncsRouter } from "./routers/mangadex-syncs-router"
import { mediaSuggestionsRouter } from "./routers/media-suggestions-router"
import { mediasRouter } from "./routers/medias-router"
import { ownershipRequestsRouter } from "./routers/ownership-requests-router"
import { searchRouter } from "./routers/search-router"
import { shopRouter } from "./routers/shop-router"
import { staffsRouter } from "./routers/staffs-router"
import { usersRouter } from "./routers/users-router"
import { enrichAudit } from "./utils/audit"
import { type ErrorCode, errors } from "./utils/errors"

declare module "hono" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Context extends AppContext {}
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface ContextVariableMap extends AppContextVariables {}
}

const hyperdxEndpoint = env.HYPERDX_ENDPOINT ?? ""
const hyperdxIngestionKey = env.HYPERDX_INGESTION_KEY ?? ""
const jsonBodyLimit = bodyLimit({
  maxSize: config.input.maxJsonBodyBytes,
  onError: (c) => c.fail("PAYLOAD_TOO_LARGE"),
})
// The reference runs on the session origin: serve its bundle from the locked dependency rather
// than an unversioned CDN URL, so every release goes through the lockfile and the release-age delay.
const scalarBundle = readFile(
  new URL("browser/standalone.js", import.meta.resolve("@scalar/api-reference")),
)
const favicon = readFile(new URL("assets/favicon.svg", import.meta.url))
// Scalar groups the sidebar by these; the OpenAPI types do not know vendor extensions.
const scalarExtensions = {
  "x-tagGroups": [
    {
      name: "Catalog",
      tags: [
        "Medias",
        "Covers",
        "Banners",
        "Staffs",
        "Media staff",
        "Media suggestions",
        "MangaDex sync",
        "Search",
      ],
    },
    {
      name: "Chapters",
      tags: ["Chapters", "Chapter review", "Chapter groups", "Page reports"],
    },
    { name: "Reading", tags: ["Bookmarks", "Reading history", "Library", "Custom lists"] },
    {
      name: "Groups",
      tags: [
        "Groups",
        "Group members",
        "Group ownership",
        "Group creation requests",
        "Group follows",
        "Group reports",
      ],
    },
    { name: "Comments", tags: ["Comments", "Comment images", "Comment reports"] },
    {
      name: "Users",
      tags: ["Users", "Profile", "Follows", "Notifications", "Settings", "Shop"],
    },
    { name: "Administration", tags: ["Dashboard", "Audit logs"] },
  ],
}

export const createApp = (services: Services) => {
  const app = new Hono()
    // Registered before the middlewares so Kubernetes probes skip logging and CORS.
    .get("/health", (c) => c.json({ status: "ok" }))
    .use(
      evlog({
        ...((process.env.TEST ?? "") !== "" || hyperdxEndpoint === "" || hyperdxIngestionKey === ""
          ? {}
          : {
              drain: createHyperDXDrain({
                endpoint: hyperdxEndpoint,
                apiKey: hyperdxIngestionKey,
              }),
            }),
        enrich: enrichAudit,
        redact: { ...auditRedactPreset, builtins: false },
        plugins: [drainPlugin("audit-logs", createAuditLogDrain(services.db))],
      }),
    )
    .use(secureHeaders({ crossOriginResourcePolicy: "same-site" }))
    .use(
      cors({
        origin: corsAllowedOrigins.length > 0 ? corsAllowedOrigins : [],
        credentials: corsAllowedOrigins.length > 0,
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "Cookie", "x-captcha-response"],
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
        c.set("mangaDex", services.mangaDex)
        c.set("mangaDexSyncQueue", services.mangaDexSyncQueue)
        c.set("mailer", services.mailer)
        c.set("notificationEvents", services.notificationEvents)
        c.set("pushSender", services.pushSender)
        c.set("vapidPublicKey", services.vapidPublicKey)
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

          c.set("errorCode", errorCode)
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
    .use(checkOrigin(corsAllowedOrigins))
    // Every body but a multipart upload is JSON, parsed whole in memory: bound it before anything
    // reads it. Uploads keep their own per-file limits.
    .use((c, next) =>
      c.req.header("content-type")?.includes("multipart/form-data") === true
        ? next()
        : jsonBodyLimit(c, next),
    )
    .notFound((c) => c.fail("NOT_FOUND"))
    .onError((err, c) => {
      if (err instanceof ImageTooComplexError) {
        return c.fail("IMAGE_TOO_COMPLEX")
      }

      c.get("log").error(err)

      return c.fail(
        "INTERNAL_SERVER_ERROR",
        process.env.NODE_ENV === "production"
          ? undefined
          : { error: err.message, stack: err.stack },
      )
    })
    .on(["GET", "POST"], "/api/auth/*", auditAuthRequest, (c) => services.auth.handler(c.req.raw))
    .get("/ping", (c) => c.json({ version: packageJson.version }))
    .route("/medias", mediasRouter)
    .route("/covers", coversRouter)
    .route("/banners", bannersRouter)
    .route("/staffs", staffsRouter)
    .route("/chapters", chaptersRouter)
    .route("/groups", groupsRouter)
    .route("/ownership-requests", ownershipRequestsRouter)
    .route("/group-invitations", groupInvitationsRouter)
    .route("/group-creation-requests", groupCreationRequestsRouter)
    .route("/group-reports", groupReportsRouter)
    .route("/media-suggestions", mediaSuggestionsRouter)
    .route("/mangadex-syncs", mangaDexSyncsRouter)
    .route("/users", usersRouter)
    .route("/lists", listsRouter)
    .route("/comments", commentsRouter)
    .route("/comment-images", commentImagesRouter)
    .route("/comment-reports", commentReportsRouter)
    .route("/dashboard", dashboardRouter)
    .route("/search", searchRouter)
    .route("/shop", shopRouter)
    .route("/audit-logs", auditLogsRouter)

  app
    .get(
      "/openapi.json",
      openAPIRouteHandler(app, {
        defaultValidationErrorResponse: false,
        documentation: {
          info: {
            title: config.openapi.title,
            version: packageJson.version,
            description: config.openapi.description,
          },
          ...scalarExtensions,
          tags: [
            {
              name: "Medias",
              description:
                "Manga, manhwa, manhua and other comics: their titles, synopses, links, tags and moderation state.",
            },
            {
              name: "Covers",
              description:
                "Cover images of a media. Listed and added under the media, read and edited by their own ID.",
            },
            {
              name: "Banners",
              description:
                "Banner images of a media. Listed and added under the media, read and edited by their own ID.",
            },
            {
              name: "Staffs",
              description: "Authors, artists and other people credited on medias.",
            },
            {
              name: "Media staff",
              description:
                "Credits linking a staff member to a media, each with a role such as `AUTHOR` or `ARTIST`.",
            },
            {
              name: "Media suggestions",
              description:
                "Edits to a media suggested by any signed-in user, reviewed field by field by uploaders, moderators and admins.",
            },
            {
              name: "MangaDex sync",
              description:
                "Comparing a media with its MangaDex entry and importing what Taiyō is missing, from titles to chapters.",
            },
            {
              name: "Chapters",
              description: "Chapters of a media: listing, reading, uploading and editing them.",
            },
            {
              name: "Chapter review",
              description:
                "Chapters waiting for review, sent by users who cannot publish directly. Uploaders and admins approve or reject them.",
            },
            {
              name: "Chapter groups",
              description: "Credits linking a chapter to the groups that worked on it.",
            },
            {
              name: "Page reports",
              description:
                "Reports about a broken or wrong chapter page, and their review by moderators.",
            },
            { name: "Bookmarks", description: "Pages you bookmarked while reading." },
            { name: "Reading history", description: "Your reading progress, chapter by chapter." },
            {
              name: "Library",
              description:
                "The medias you track in your library, with a status such as reading or completed.",
            },
            {
              name: "Custom lists",
              description:
                "Reading lists made by users. Each list has an owner, a `PUBLIC` or `PRIVATE` visibility and an ordered set of medias.",
            },
            {
              name: "Groups",
              description: "Scanlation and translation groups that release chapters.",
            },
            {
              name: "Group members",
              description:
                "The members of a group: invitations, permissions, promotion, removal and leaving.",
            },
            {
              name: "Group ownership",
              description: "Requests to claim ownership of an existing group, and their review.",
            },
            {
              name: "Group creation requests",
              description: "Requests to create a new group you will own, and their review.",
            },
            {
              name: "Group follows",
              description: "Following a group to hear about its new chapters.",
            },
            {
              name: "Group reports",
              description: "Reports about a group, and their review by moderators.",
            },
            {
              name: "Comments",
              description: "Comments and replies on medias, chapters, groups, users and lists.",
            },
            {
              name: "Comment images",
              description: "Images attached to comments, and your saved favorites.",
            },
            {
              name: "Comment reports",
              description: "Reports about a comment, and their review by moderators.",
            },
            { name: "Users", description: "User profiles, stats and moderation: roles and bans." },
            {
              name: "Profile",
              description: "Your own profile: display name, avatar, banner, cosmetics and account.",
            },
            {
              name: "Follows",
              description:
                "Following other users. A follow goes one way; following each other takes two follows.",
            },
            {
              name: "Notifications",
              description: "Your notifications and your devices' push subscriptions.",
            },
            {
              name: "Settings",
              description: "Your preferences, saved on your account so every device shares them.",
            },
            {
              name: "Shop",
              description:
                "Spending reading points on cosmetics, through direct purchases or loot boxes with published odds.",
            },
            {
              name: "Search",
              description: "Type-ahead search across medias, groups and users at once.",
            },
            {
              name: "Dashboard",
              description:
                "Dashboard data: activity metrics, reading breakdowns and pending moderation work.",
            },
            {
              name: "Audit logs",
              description:
                "Every recorded action: who did what, on which resource, when, from where, and whether it succeeded, failed or was denied.",
            },
          ],
        },
      }),
    )
    .get("/docs/scalar.js", async (c) => {
      c.header("Content-Type", "text/javascript; charset=utf-8")
      c.header("Cache-Control", "public, max-age=86400")

      return c.body(await scalarBundle)
    })
    .get("/docs/favicon.svg", async (c) => {
      c.header("Content-Type", "image/svg+xml")
      c.header("Cache-Control", "public, max-age=86400")

      return c.body(await favicon)
    })
    .get(
      "/docs",
      secureHeaders({
        contentSecurityPolicy: {
          defaultSrc: ["'none'"],
          scriptSrc: [NONCE],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'", "data:"],
          workerSrc: ["'self'", "blob:"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
          frameAncestors: ["'none'"],
        },
      }),
      Scalar((c) => {
        const nonce = c.get("secureHeadersNonce")

        return {
          pageTitle: config.openapi.title,
          favicon: "/docs/favicon.svg",
          theme: "deepSpace",
          url: "/openapi.json",
          cdn: "/docs/scalar.js",
          telemetry: false,
          withDefaultFonts: false,
          ...(nonce === undefined ? {} : { nonce }),
        }
      }),
    )

  return app
}

export type AppType = ReturnType<typeof createApp>
