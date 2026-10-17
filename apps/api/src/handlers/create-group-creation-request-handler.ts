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
    .meta({ description: "Name of the new group.", example: "Akira Scans" }),
  description: z
    .string()
    .trim()
    .min(1)
    .max(config.input.maxDescriptionLength)
    .nullable()
    .optional()
    .meta({ description: "Description of the new group." }),
  message: requestMessageSchema,
  proofLinks: proofLinksSchema,
})

export const createGroupCreationRequestHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Request a new group",
    description: `Asks the admins to create a group with the requester as its owner. Refused when an existing group already has the name, since that group should be claimed instead. A user can have at most ${MAX_PENDING} pending requests.\n\n**Authentication:** any signed-in user.`,
    tags: ["Group creation requests"],
    requestBody: {
      content: { "application/json": await resolver(createSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Request created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid(), status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        409: "A group already has this name, you already asked for it, or you have too many pending requests.",
        422: "The request data failed validation.",
        429: "Too many requests — slow down.",
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
