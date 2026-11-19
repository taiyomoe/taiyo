import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { withdrawSuggestions } from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const withdrawMediaSuggestionHandler = new Hono().post(
  "/:id/withdraw",
  describeRoute({
    summary: "Withdraw a media suggestion",
    description:
      "Withdraws one of your suggestions that is still waiting for review.\n\n**Required access:** the author of the suggestion.",
    tags: ["Media suggestions"],
    responses: {
      201: {
        description: "Suggestion withdrawn.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the suggestion." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not the author of the suggestion, or you do not have permission to perform this action.",
        404: "No suggestion with the given ID exists, or its media was deleted, or you cannot see it.",
        409: "The suggestion is no longer pending.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(mediaSuggestionAudit.WITHDRAW),
  withAuth(),
  checkMediaSuggestion(),
  withTransaction,
  async (c) => {
    const { can, db, mediaSuggestion, user } = c.var

    c.var.audit.set({ target: { mediaId: mediaSuggestion.mediaId } })

    const locked = await db
      .selectFrom("mediaSuggestions")
      .select(["authorId", "status"])
      .where("id", "=", mediaSuggestion.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (!can("mediaSuggestion.withdraw", locked)) {
      return locked.authorId === user.id
        ? c.fail("MEDIA_SUGGESTION_NOT_PENDING")
        : c.fail("FORBIDDEN")
    }

    await withdrawSuggestions(db, [mediaSuggestion.id])

    return c.ok({ id: mediaSuggestion.id })
  },
)
