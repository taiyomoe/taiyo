import { commentImageAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { DeleteObjectsCommand } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })
const bodySchema = z.object({
  block: z
    .boolean()
    .default(true)
    .meta({ description: "Also refuse future uploads of this image and close lookalikes." }),
})

export const removeCommentImageHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Remove a comment image everywhere",
    description:
      "Deletes an image's file, takes it out of everyone's favorites, and shows a placeholder wherever a comment used it. By default the image is also blocked from being uploaded again.\n\n**Required roles:** moderator, admin.",
    tags: ["Comment images"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Image removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid(),
                  comments: z.int().meta({ description: "How many comments used it." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 404: "The image doesn't exist or was already removed." }),
    },
  }),
  audited(commentImageAudit.REMOVE),
  withAuth("comment.removeImage"),
  validateParam(paramSchema),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, user } = c.var
    const { id } = c.var.param
    const { block } = c.var.json
    const image = await db
      .updateTable("commentImages")
      .set({ removedAt: sql<Date>`CURRENT_TIMESTAMP`, removerId: user.id })
      .where("id", "=", id)
      .where("removedAt", "is", null)
      .returning(["id", "key", "sha256", "dhash", "uploaderId", "width", "height"])
      .executeTakeFirst()

    if (image === undefined) {
      return c.fail("COMMENT_IMAGE_NOT_FOUND")
    }

    await db.deleteFrom("commentImageFavorites").where("imageId", "=", id).execute()

    if (block) {
      await db
        .insertInto("blockedCommentImages")
        .values({
          sha256: image.sha256,
          dhash: image.dhash,
          width: image.width,
          height: image.height,
          imageId: id,
          blockerId: user.id,
        })
        .onConflict((oc) => oc.column("sha256").doNothing())
        .execute()
    }

    const { count } = await db
      .selectFrom("commentImageUsages")
      .select(sql<string>`count(*)`.as("count"))
      .where("imageId", "=", id)
      .executeTakeFirstOrThrow()

    c.var.afterCommit(async () => {
      await s3.send(
        new DeleteObjectsCommand({ Bucket: s3Bucket, Delete: { Objects: [{ Key: image.key }] } }),
      )
    })
    c.var.audit.set({ target: { uploaderId: image.uploaderId, block, sha256: image.sha256 } })

    return c.ok({ id, comments: Number(count) })
  },
)
