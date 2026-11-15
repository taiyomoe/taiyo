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
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES).default("PENDING").meta({
    description: "Only list requests with this status. Defaults to `PENDING`.",
    example: "PENDING",
  }),
})
const itemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group creation request." }),
  status: z
    .enum(GROUP_OWNERSHIP_REQUEST_STATUSES)
    .meta({ description: "The status of the request.", example: "PENDING" }),
  name: z
    .string()
    .meta({ description: "The name of the requested group.", example: "Akira Scans" }),
  description: z.string().nullable().meta({
    description: "The description of the requested group, if any.",
    example: "Translating seinen manga into English since 2019.",
  }),
  message: z.string().meta({
    description: "The requester's message to the admins.",
    example: "I founded Akira Scans in 2019 and still lead the team.",
  }),
  proofLinks: z
    .url()
    .array()
    .meta({
      description: "The public links proving the requester runs the group.",
      example: ["https://discord.gg/akira-scans"],
    }),
  reviewerNote: z.string().nullable().meta({
    description: "The note the admin left for the requester, if any.",
    example: "No proof of ownership.",
  }),
  groupId: z
    .uuid()
    .nullable()
    .meta({ description: "The ID of the group created on approval, if any." }),
  nameTaken: z
    .boolean()
    .meta({ description: "Whether an existing group has this name right now." }),
  requester: userSummarySchema.meta({ description: "The user who filed the request." }),
  createdAt: z.iso.datetime().meta({ description: "When the request was filed." }),
  updatedAt: z.iso.datetime().meta({ description: "When the request was last updated." }),
})

export const listGroupCreationRequestsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List group creation requests",
    description:
      "Lists the group creation requests with the given status. Pending requests come oldest first so the queue is worked in order, others newest first.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    responses: {
      200: {
        description: "The matching group creation requests.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)),
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
          "users.nameEffect",
          "users.avatarBorder",
        ])
        .orderBy("groupCreationRequests.createdAt", status === "PENDING" ? "asc" : "desc")
        .orderBy("groupCreationRequests.id", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(
      rows.map(
        ({
          userId,
          username,
          displayUsername,
          image,
          nameEffect,
          avatarBorder,
          nameTaken,
          ...row
        }) => ({
          ...row,
          nameTaken: Boolean(nameTaken),
          requester: { id: userId, username, displayUsername, image, nameEffect, avatarBorder },
        }),
      ),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
