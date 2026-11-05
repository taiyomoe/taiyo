import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { groupCommentSchema, selectGroupComments, toGroupComment } from "../utils/group-comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const listGroupCommentsHandler = new Hono().get(
  "/:id/comments",
  describeRoute({
    summary: "List comments on a group",
    description:
      "Lists the comments left on the group's page, newest first.\n\n**Authentication:** none.",
    tags: ["Group comments"],
    responses: {
      200: {
        description: "Comments on the group.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(groupCommentSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id or query parameters failed validation.",
      }),
    },
  }),
  validateQuery(paginationQuerySchema),
  checkGroup(),
  async (c) => {
    const { db, group } = c.var
    const { page, perPage } = c.var.query
    const [rows, totalRow] = await Promise.all([
      selectGroupComments(db, group.id)
        .orderBy("groupComments.createdAt", "desc")
        .orderBy("groupComments.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("groupComments")
        .where("groupId", "=", group.id)
        .where("deletedAt", "is", null)
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(rows.map(toGroupComment), { page, perPage, total: Number(totalRow.count) })
  },
)
