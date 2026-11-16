import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"

const paramSchema = z.object({
  mangaDexId: z.uuid().meta({ description: "The ID of the manga on MangaDex." }),
  fileName: z
    .string()
    .regex(/^[\w-]+\.(?:jpe?g|png|gif|webp)$/i)
    .meta({ description: "The file name of the cover on MangaDex." }),
})

export const getMangaDexCoverHandler = new Hono().get(
  "/covers/:mangaDexId/:fileName",
  describeRoute({
    summary: "Preview a MangaDex cover",
    description:
      "Returns a 256px-wide JPEG of a MangaDex cover. MangaDex turns browsers away from its image server, so the preview goes through Taiyō.\n\n**Required roles:** uploader, admin.",
    tags: ["MangaDex sync"],
    responses: {
      200: {
        description: "The cover preview.",
        content: { "image/jpeg": { schema: { type: "string", format: "binary" } } },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The MangaDex ID or the file name is not valid.",
        502: "MangaDex could not serve the cover.",
      }),
    },
  }),
  withAuth("media.syncMangaDex"),
  validateParam(paramSchema),
  async (c) => {
    const { mangaDexId, fileName } = c.var.param
    const bytes = await c.var.mangaDex
      .download(`${config.mangaDex.uploadsUrl}/covers/${mangaDexId}/${fileName}.256.jpg`)
      .catch(() => null)

    if (bytes === null) {
      return c.fail("MANGADEX_UNAVAILABLE")
    }

    return c.body(new Uint8Array(bytes), 200, {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=86400",
    })
  },
)
