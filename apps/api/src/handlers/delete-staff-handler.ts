import { staffAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkStaff } from "../middlewares/check-staff-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteStaffHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a staff",
    description:
      "Deletes a staff. It no longer appears in staff listings or on the medias it was linked to.\n\n**Required roles:** uploader, admin.",
    tags: ["Staffs"],
    responses: {
      200: {
        description: "Staff deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted staff." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No staff with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(staffAudit.DELETE),
  withAuth("staff.delete"),
  checkStaff(),
  withTransaction,
  async (c) => {
    const { db, staff, user } = c.var

    await db
      .updateTable("staffs")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", staff.id)
      .execute()

    return c.ok({ id: staff.id })
  },
)
