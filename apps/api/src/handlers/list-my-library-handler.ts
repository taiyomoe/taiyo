import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z.enum(USER_LIBRARY_STATUSES).optional().meta({
    description: "Only list the entries with this status. Defaults to every status.",
    example: "READING",
  }),
})
const libraryItemSchema = z.object({
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
  status: z
    .enum(USER_LIBRARY_STATUSES)
    .meta({ description: "The status of the media in your library.", example: "READING" }),
  notify: z.boolean().meta({ description: "Whether new chapters of the media notify you." }),
  createdAt: z.iso.datetime().meta({ description: "When you added the media to your library." }),
  updatedAt: z.iso.datetime().meta({ description: "When you last changed the entry." }),
})

export const listMyLibraryHandler = new Hono().get(
  "/me/library",
  describeRoute({
    summary: "List my library",
    description:
      "Lists the entries of your library, most recently updated first.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your library.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(libraryItemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage, status } = c.var.query
    let base = db
      .selectFrom("userLibraryEntries")
      .where("userId", "=", user.id)
      .where((eb) =>
        eb.exists(
          eb
            .selectFrom("medias")
            .select("medias.id")
            .whereRef("medias.id", "=", "userLibraryEntries.mediaId")
            .where("medias.deletedAt", "is", null),
        ),
      )

    if (status) {
      base = base.where("status", "=", status)
    }

    const [items, totalRow] = await Promise.all([
      base
        .select(["mediaId", "status", "notify", "createdAt", "updatedAt"])
        .orderBy("updatedAt", "desc")
        .orderBy("mediaId", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(db.fn.countAll().as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
