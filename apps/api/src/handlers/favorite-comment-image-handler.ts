import { commentImageAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })
const resultSchema = z.object({ id: z.uuid(), favorited: z.boolean() })

export const favoriteCommentImageHandler = new Hono()
  .put(
    "/:id/favorite",
    describeRoute({
      summary: "Favorite a comment image",
      description: `Adds an image you saw in a comment, or one you uploaded, to your favorites so you can use it in your own comments. You can keep up to ${config.comments.maxFavoriteImages}.\n\n**Authentication:** signed-in user.`,
      tags: ["Comment images"],
      responses: {
        200: {
          description: "Image favorited.",
          content: { "application/json": { schema: resolver(apiSuccessEnvelope(resultSchema)) } },
        },
        ...getOpenApiResponses({
          404: "The image doesn't exist, was removed, or isn't used in any comment you can see.",
          409: "Your favorites are full.",
          429: "Too many requests — slow down.",
        }),
      },
    }),
    audited(commentImageAudit.FAVORITE),
    withAuth(),
    rateLimit({ prefix: "favorite-comment-image", windowMs: 60_000, limit: 60 }),
    validateParam(paramSchema),
    withTransaction,
    async (c) => {
      const { db, user } = c.var
      const { id } = c.var.param
      const image = await db
        .selectFrom("commentImages as ci")
        .select("ci.id")
        .where("ci.id", "=", id)
        .where("ci.removedAt", "is", null)
        .where((eb) =>
          eb.or([
            eb("ci.uploaderId", "=", user.id),
            eb.exists(
              eb
                .selectFrom("commentImageUsages as cu")
                .innerJoin("comments as c", "c.id", "cu.commentId")
                .select("cu.imageId")
                .whereRef("cu.imageId", "=", "ci.id")
                .where("c.deletedAt", "is", null),
            ),
          ]),
        )
        .executeTakeFirst()

      if (image === undefined) {
        return c.fail("COMMENT_IMAGE_NOT_FOUND")
      }

      await sql`select pg_advisory_xact_lock(hashtext(${`comment-favorites:${user.id}`}))`.execute(
        db,
      )

      const { count } = await db
        .selectFrom("commentImageFavorites")
        .select(sql<string>`count(*)`.as("count"))
        .where("userId", "=", user.id)
        .executeTakeFirstOrThrow()
      const already = await db
        .selectFrom("commentImageFavorites")
        .select("imageId")
        .where("userId", "=", user.id)
        .where("imageId", "=", id)
        .executeTakeFirst()

      if (already === undefined && Number(count) >= config.comments.maxFavoriteImages) {
        return c.fail("COMMENT_FAVORITES_FULL")
      }

      await db
        .insertInto("commentImageFavorites")
        .values({ userId: user.id, imageId: id })
        .onConflict((oc) => oc.columns(["userId", "imageId"]).doNothing())
        .execute()

      return c.ok({ id, favorited: true })
    },
  )
  .delete(
    "/:id/favorite",
    describeRoute({
      summary: "Unfavorite a comment image",
      description:
        "Removes an image from your favorites. Removing one that isn't there is a no-op.\n\n**Authentication:** signed-in user.",
      tags: ["Comment images"],
      responses: {
        200: {
          description: "Image unfavorited.",
          content: { "application/json": { schema: resolver(apiSuccessEnvelope(resultSchema)) } },
        },
        ...getOpenApiResponses({ 422: "The id is not a valid UUID." }),
      },
    }),
    audited(commentImageAudit.UNFAVORITE),
    withAuth(),
    validateParam(paramSchema),
    async (c) => {
      const { db, user } = c.var
      const { id } = c.var.param

      await db
        .deleteFrom("commentImageFavorites")
        .where("userId", "=", user.id)
        .where("imageId", "=", id)
        .execute()

      return c.ok({ id, favorited: false })
    },
  )
