import { config } from "@taiyomoe/config"
import { USER_LIST_VISIBILITIES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const updateListSchema = z
  .object({
    name: z.string().min(1).max(config.input.maxNameLength).optional(),
    description: z.string().max(config.input.maxDescriptionLength).nullable().optional(),
    visibility: z.enum(USER_LIST_VISIBILITIES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateListHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a list",
    description:
      "Updates the metadata of a list. Only the owner can update.\n\n**Authentication:** list owner.",
    tags: ["Custom lists"],
    requestBody: {
      content: { "application/json": await resolver(updateListSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "List updated.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No list with the given id exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "List"),
  validateJson(updateListSchema),
  checkList(),
  requireListOwner,
  withTransaction,
  async (c) => {
    const { db, list } = c.var
    const body = c.var.json
    const updates: Record<string, unknown> = {}

    for (const key of ["name", "description", "visibility"] as const) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    await db.updateTable("userLists").set(updates).where("id", "=", list.id).execute()

    return c.ok({ id: list.id })
  },
)
