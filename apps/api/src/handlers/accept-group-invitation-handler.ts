import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { acceptGroupInvitation } from "../group-membership"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })

export const acceptGroupInvitationHandler = new Hono().post(
  "/:id/accept",
  describeRoute({
    summary: "Accept a group invitation",
    description:
      "Joins the group with the permissions from the invitation. Refused if the invitation expired, or if the person who sent it can no longer grant those permissions.\n\n**Authentication:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Invitation accepted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid(), groupId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No invitation with the given id was sent to you.",
        409: "The invitation was already answered, expired or is no longer valid, or you are already a member.",
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
    const result = await acceptGroupInvitation(db, { userId: user.id, invitationId: id })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ id, groupId: result.groupId })
  },
)
