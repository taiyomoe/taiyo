import { GROUP_OWNERSHIP_REQUEST_STATUSES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(GROUP_OWNERSHIP_REQUEST_STATUSES)
    .default("PENDING")
    .meta({ description: "Only list requests with this status. Default: PENDING." }),
})
const itemSchema = z.object({
  id: z.uuid(),
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES),
  name: z.string(),
  description: z.string().nullable(),
  message: z.string(),
  proofLinks: z.url().array(),
  reviewerNote: z.string().nullable(),
  groupId: z.uuid().nullable().meta({ description: "The group created on approval." }),
  nameTaken: z
    .boolean()
    .meta({ description: "Whether an existing group has this name right now." }),
  requester: userSummarySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const listGroupCreationRequestsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List group creation requests",
    description:
      "Lists requests for new groups, oldest first for pending ones so the queue is worked in order.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    responses: {
      200: {
        description: "Group creation requests.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth("groupCreationRequest.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, status } = c.var.query
    const base = db
      .selectFrom("groupCreationRequests")
      .innerJoin("users", "users.id", "groupCreationRequests.userId")
      .where("groupCreationRequests.status", "=", status)
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "groupCreationRequests.id",
          "groupCreationRequests.status",
          "groupCreationRequests.name",
          "groupCreationRequests.description",
          "groupCreationRequests.message",
          "groupCreationRequests.proofLinks",
          "groupCreationRequests.reviewerNote",
          "groupCreationRequests.groupId",
          "groupCreationRequests.createdAt",
          "groupCreationRequests.updatedAt",
          eb
            .exists(
              eb
                .selectFrom("groups")
                .select("groups.id")
                .where(sql`lower("groups"."name")`, "=", sql`lower("groupCreationRequests"."name")`)
                .where("groups.deletedAt", "is", null),
            )
            .as("nameTaken"),
          "users.id as userId",
          "users.username",
          "users.displayUsername",
          "users.image",
        ])
        .orderBy("groupCreationRequests.createdAt", status === "PENDING" ? "asc" : "desc")
        .orderBy("groupCreationRequests.id", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(
      rows.map(({ userId, username, displayUsername, image, nameTaken, ...row }) => ({
        ...row,
        nameTaken: Boolean(nameTaken),
        requester: { id: userId, username, displayUsername, image },
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
