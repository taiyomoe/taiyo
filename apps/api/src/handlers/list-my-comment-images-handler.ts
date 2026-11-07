import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { toCommentImage } from "../comment-images"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { commentImageSchema } from "./upload-comment-image-handler"

const querySchema = z.object({
  collection: z
    .enum(["favorites", "uploads"])
    .default("favorites")
    .meta({ description: "Your favorites, or the images you uploaded and posted." }),
  cursor: z
    .string()
    .max(200)
    .optional()
    .meta({ description: "The `nextCursor` of the previous page." }),
  limit: z.coerce.number().int().min(1).max(60).default(30),
})
const cursorSchema = z.tuple([
  z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/),
  z.uuid(),
])
const decode = (cursor: string | undefined) => {
  if (cursor === undefined) {
    return null
  }

  try {
    const parsed = cursorSchema.safeParse(JSON.parse(Buffer.from(cursor, "base64url").toString()))

    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export const listMyCommentImagesHandler = new Hono().get(
  "/me",
  describeRoute({
    summary: "List my comment images",
    description:
      "Lists the images you can put in comments: your favorites, or the images you uploaded and posted, newest first.\n\n**Authentication:** signed-in user.",
    tags: ["Comment images"],
    responses: {
      200: {
        description: "A page of images.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                commentImageSchema.extend({ favorited: z.boolean() }).array(),
                z.object({ nextCursor: z.string().nullable() }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { collection, cursor, limit } = c.var.query
    const after = decode(cursor)
    const sortColumn = collection === "favorites" ? sql.ref("f.createdAt") : sql.ref("ci.createdAt")
    let query = db
      .selectFrom("commentImages as ci")
      .leftJoin("commentImageFavorites as f", (join) =>
        join.onRef("f.imageId", "=", "ci.id").on("f.userId", "=", user.id),
      )
      .select([
        "ci.id",
        "ci.key",
        "ci.width",
        "ci.height",
        "ci.animated",
        "ci.uploaderId",
        sql<boolean>`"f"."userId" is not null`.as("favorited"),
        sql<string>`to_char(${sortColumn}, 'YYYY-MM-DD"T"HH24:MI:SS.MS')`.as("sortAt"),
      ])
      .where("ci.removedAt", "is", null)

    query =
      collection === "favorites"
        ? query.where("f.userId", "is not", null)
        : query
            .where("ci.uploaderId", "=", user.id)
            .where((eb) =>
              eb.exists(
                eb
                  .selectFrom("commentImageUsages as cu")
                  .select("cu.imageId")
                  .whereRef("cu.imageId", "=", "ci.id"),
              ),
            )

    if (after !== null) {
      query = query.where(
        sql<boolean>`(${sortColumn}, "ci"."id") < (${after[0]}::timestamp, ${after[1]}::uuid)`,
      )
    }

    const rows = await query
      .orderBy(sql`${sortColumn} desc`)
      .orderBy("ci.id", "desc")
      .limit(limit + 1)
      .execute()
    const page = rows.slice(0, limit)
    const last = page.at(-1)

    return c.ok(
      page.map((row) => ({ ...toCommentImage(row), favorited: row.favorited })),
      {
        nextCursor:
          rows.length > limit && last !== undefined
            ? Buffer.from(JSON.stringify([last.sortAt, last.id])).toString("base64url")
            : null,
      },
    )
  },
)
