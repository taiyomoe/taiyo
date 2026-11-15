import { groupCreationAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { isGroupNameTaken } from "../utils/group-names"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, proofLinksSchema, requestMessageSchema } from "../utils/schemas"

const MAX_PENDING = 3
const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(config.input.maxNameLength)
    .meta({ description: "The name of the group to create.", example: "Akira Scans" }),
  description: z
    .string()
    .trim()
    .min(1)
    .max(config.input.maxDescriptionLength)
    .nullable()
    .optional()
    .meta({
      description: "The description of the group to create.",
      example: "Translating seinen manga into English since 2019.",
    }),
  message: requestMessageSchema,
  proofLinks: proofLinksSchema,
})

export const createGroupCreationRequestHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Request a new group",
    description: `Requests a new group with you as its owner, for an admin to review. A group that already exists under this name must be claimed with an ownership request instead. You can have at most ${MAX_PENDING} pending requests.\n\n**Authentication:** signed-in user.`,
    tags: ["Group creation requests"],
    responses: {
      201: {
        description: "Group creation request created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the group creation request." }),
                  status: z
                    .enum(GROUP_OWNERSHIP_REQUEST_STATUSES)
                    .meta({ description: "The status of the request.", example: "PENDING" }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        409: "A group with this name already exists, or you already have a pending request for this name, or you have too many pending requests.",
        422: "The request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(groupCreationAudit.REQUEST_CREATE),
  withAuth("groupCreationRequest.create"),
  rateLimit({ prefix: "group-creation-request", windowMs: 60_000, limit: 10 }),
  validateJson(createSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { name, description, message, proofLinks } = c.var.json

    await db.selectFrom("users").select("id").where("id", "=", user.id).forUpdate().execute()

    if (await isGroupNameTaken(db, name)) {
      return c.fail("GROUP_NAME_TAKEN")
    }

    const pending = await db
      .selectFrom("groupCreationRequests")
      .select(["name"])
      .where("userId", "=", user.id)
      .where("status", "=", "PENDING")
      .execute()

    if (pending.some((request) => request.name.toLowerCase() === name.toLowerCase())) {
      return c.fail("GROUP_CREATION_REQUEST_EXISTS")
    }

    if (pending.length >= MAX_PENDING) {
      return c.fail("GROUP_CREATION_REQUEST_LIMIT")
    }

    const row = await db
      .insertInto("groupCreationRequests")
      .values({
        userId: user.id,
        name,
        description: description ?? null,
        message,
        proofLinks,
      })
      .returning(["id", "status"])
      .executeTakeFirstOrThrow()

    c.var.audit.set({ target: { id: row.id, name } })

    return c.ok({ id: row.id, status: row.status })
  },
)
