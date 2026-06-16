import { config } from "@taiyomoe/config"
import { USER_LIST_VISIBILITIES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const createListSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(config.input.maxNameLength)
    .meta({ description: "Name of the list.", example: "Best shounen" }),
  description: z
    .string()
    .max(config.input.maxDescriptionLength)
    .nullable()
    .optional()
    .meta({ description: "Optional description." }),
  visibility: z
    .enum(USER_LIST_VISIBILITIES)
    .default("PRIVATE")
    .meta({ description: "Who can see the list. Defaults to PRIVATE." }),
})

export const createListHandler = new Hono().post(
  "/me/lists",
  describeRoute({
    summary: "Create a list",
    description:
      "Creates a custom user list. Defaults to PRIVATE.\n\n**Authentication:** signed-in user.",
    tags: ["Custom lists"],
    requestBody: {
      content: { "application/json": await resolver(createListSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "List created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the new list." }),
                  visibility: z.enum(USER_LIST_VISIBILITIES),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The request data failed validation." }),
    },
  }),
  withAuth("create", "List"),
  validateJson(createListSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { name, description, visibility } = c.var.json
    const row = await db
      .insertInto("userLists")
      .values({
        userId: user.id,
        name,
        description: description ?? null,
        visibility,
      })
      .returning(["id", "visibility"])
      .executeTakeFirstOrThrow()

    return c.ok({ id: row.id, visibility: row.visibility })
  },
)
