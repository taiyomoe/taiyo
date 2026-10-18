import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })

export const declineGroupInvitationHandler = new Hono().post(
  "/:id/decline",
  describeRoute({
    summary: "Decline a group invitation",
    description: "Declines a pending invitation.\n\n**Authentication:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Invitation declined.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))) },
        },
      },
      ...getOpenApiResponses({
        404: "No invitation with the given id was sent to you.",
        409: "The invitation was already answered or cancelled.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const invitation = await db
      .selectFrom("groupInvitations")
      .select("status")
      .where("id", "=", id)
      .where("inviteeId", "=", user.id)
      .forUpdate()
      .executeTakeFirst()

    if (invitation === undefined) {
      return c.fail("GROUP_INVITATION_NOT_FOUND")
    }

    if (invitation.status !== "PENDING") {
      return c.fail("GROUP_INVITATION_NOT_PENDING")
    }

    await db
      .updateTable("groupInvitations")
      .set({ status: "DECLINED" })
      .where("id", "=", id)
      .execute()

    return c.ok({ id })
  },
)
