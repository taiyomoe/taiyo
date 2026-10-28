import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  checkMediaEdit,
  diffMediaEdit,
  editedFields,
  normalizeMediaEdit,
  pickFields,
  readMediaEdit,
} from "../utils/media-edit"
import { mediaSuggestionBodySchema } from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const createMediaSuggestionHandler = new Hono().post(
  "/:id/suggestions",
  describeRoute({
    summary: "Suggest an edit to a media",
    description: `Sends changes to a media's details, titles, tags, links or staff credits for review. Only the fields that differ from the media are kept. A user can have one pending suggestion per media, and at most ${config.input.maxPendingSuggestions} pending suggestions in total.\n\n**Authentication:** signed-in user.`,
    tags: ["Media suggestions"],
    requestBody: {
      content: {
        "application/json": await resolver(mediaSuggestionBodySchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Suggestion sent.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists, or one of the staff members does not exist.",
        409: "The user already has a pending suggestion for this media or too many pending suggestions, or a link already belongs to another media.",
        422: "The request data failed validation, or the suggestion changes nothing.",
        429: "Too many suggestions were sent recently.",
      }),
    },
  }),
  audited(mediaSuggestionAudit.CREATE, (c) => ({ mediaId: c.req.param("id") })),
  withAuth("media.suggest"),
  rateLimit({ prefix: "media-suggestion", windowMs: 60_000, limit: 20 }),
  validateJson(mediaSuggestionBodySchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media, user } = c.var
    const body = c.var.json

    await db.selectFrom("users").select("id").where("id", "=", user.id).forUpdate().execute()

    const existing = await db
      .selectFrom("mediaSuggestions")
      .select("id")
      .where("mediaId", "=", media.id)
      .where("authorId", "=", user.id)
      .where("status", "=", "PENDING")
      .executeTakeFirst()

    if (existing) {
      return c.fail("MEDIA_SUGGESTION_EXISTS", { suggestionId: existing.id })
    }

    const { count } = await db
      .selectFrom("mediaSuggestions")
      .select(sql<string>`count(*)`.as("count"))
      .where("authorId", "=", user.id)
      .where("status", "=", "PENDING")
      .executeTakeFirstOrThrow()

    if (Number(count) >= config.input.maxPendingSuggestions) {
      return c.fail("MEDIA_SUGGESTION_LIMIT")
    }

    const current = await readMediaEdit(db, media.id)
    const changes = diffMediaEdit(current, normalizeMediaEdit(body.changes))
    const fields = editedFields(changes)

    c.var.audit.set({ target: { fields } })

    if (fields.length === 0) {
      return c.fail("MEDIA_SUGGESTION_EMPTY")
    }

    const error = await checkMediaEdit(db, media.id, changes)

    if (error?.code === "MEDIA_LINK_CONFLICT") {
      return c.fail(error.code, error.details)
    }

    if (error !== null) {
      return c.fail(error.code)
    }

    const { id } = await db
      .insertInto("mediaSuggestions")
      .values({
        mediaId: media.id,
        authorId: user.id,
        changes,
        base: pickFields(current, fields),
        note: body.note ?? null,
      })
      .returning("id")
      .executeTakeFirstOrThrow()

    c.var.audit.set({ target: { id } })

    return c.ok({ id })
  },
)
