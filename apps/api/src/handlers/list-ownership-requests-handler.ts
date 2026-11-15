import { GROUP_OWNERSHIP_REQUEST_STATUSES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupSummarySchema, userSummarySchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES).default("PENDING").meta({
    description: "Only list requests with this status. Defaults to `PENDING`.",
    example: "PENDING",
  }),
})
const itemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the ownership request." }),
  status: z
    .enum(GROUP_OWNERSHIP_REQUEST_STATUSES)
    .meta({ description: "The status of the ownership request.", example: "PENDING" }),
  message: z.string().nullable().meta({
    description: "The requester's message to the admins, if any.",
    example: "I founded Akira Scans in 2019 and still lead the team.",
  }),
  proofLinks: z
    .url()
    .array()
    .meta({
      description: "The public links proving the requester's claim.",
      example: ["https://discord.gg/akira-scans"],
    }),
  reviewerNote: z.string().nullable().meta({
    description: "The note the admin left for the requester, if any.",
    example: "No proof of ownership.",
  }),
  group: groupSummarySchema
    .extend({
      owned: z.boolean().meta({ description: "Whether the group has an owner right now." }),
    })
    .meta({ description: "The group the requester asked to own." }),
  requester: userSummarySchema.meta({ description: "The user who filed the request." }),
  createdAt: z.iso.datetime().meta({ description: "When the request was filed." }),
  updatedAt: z.iso.datetime().meta({ description: "When the request was last updated." }),
})

export const listOwnershipRequestsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List ownership requests",
    description:
      "Lists the ownership requests with the given status across every group. Pending requests come oldest first so the queue is worked in order, others newest first. Requests on deleted groups are left out.\n\n**Required roles:** admin.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "The matching ownership requests.",
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
  withAuth("ownershipRequest.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, status } = c.var.query
    const base = db
      .selectFrom("groupOwnershipRequests")
      .innerJoin("groups", "groups.id", "groupOwnershipRequests.groupId")
      .innerJoin("users", "users.id", "groupOwnershipRequests.userId")
      .where("groupOwnershipRequests.status", "=", status)
      .where("groups.deletedAt", "is", null)
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "groupOwnershipRequests.id",
          "groupOwnershipRequests.status",
          "groupOwnershipRequests.message",
          "groupOwnershipRequests.proofLinks",
          "groupOwnershipRequests.reviewerNote",
          "groupOwnershipRequests.createdAt",
          "groupOwnershipRequests.updatedAt",
          "groups.id as groupId",
          "groups.name as groupName",
          "groups.logo as groupLogo",
          eb
            .exists(
              eb
                .selectFrom("groupMemberships")
                .select("groupMemberships.userId")
                .whereRef("groupMemberships.groupId", "=", "groups.id")
                .where("groupMemberships.role", "=", "OWNER"),
            )
            .as("owned"),
          "users.id as userId",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
        ])
        .orderBy("groupOwnershipRequests.createdAt", status === "PENDING" ? "asc" : "desc")
        .orderBy("groupOwnershipRequests.id", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        status: row.status,
        message: row.message,
        proofLinks: row.proofLinks,
        reviewerNote: row.reviewerNote,
        group: {
          id: row.groupId,
          name: row.groupName,
          logo: row.groupLogo,
          owned: Boolean(row.owned),
        },
        requester: {
          id: row.userId,
          username: row.username,
          displayUsername: row.displayUsername,
          image: row.image,
          nameEffect: row.nameEffect,
          avatarBorder: row.avatarBorder,
        },
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
