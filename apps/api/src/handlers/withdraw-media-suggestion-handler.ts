import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const withdrawMediaSuggestionHandler = new Hono().post(
  "/:id/withdraw",
  describeRoute({
    summary: "Withdraw a media suggestion",
    description:
      "Withdraws a suggestion that is still waiting for review.\n\n**Authentication:** the author of the suggestion.",
    tags: ["Media suggestions"],
    responses: {
      201: {
        description: "Suggestion withdrawn.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No suggestion with the given id exists.",
        409: "The suggestion was already reviewed or withdrawn.",
        422: "The provided id is not a valid UUID.",
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

    await db
      .updateTable("mediaSuggestions")
      .set({ status: "WITHDRAWN" })
      .where("id", "=", mediaSuggestion.id)
      .execute()

    return c.ok({ id: mediaSuggestion.id })
  },
)
