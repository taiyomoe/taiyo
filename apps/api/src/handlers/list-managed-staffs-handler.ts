import { sql, STAFF_ROLES } from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { escapeLike } from "../utils/escape-like"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description: "Only list the staffs whose name contains this text, ignoring case.",
    example: "Kishimoto",
  }),
})
const managedStaffSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the staff." }),
  name: z.string().meta({ description: "The name of the staff.", example: "Kishimoto Masashi" }),
  imageUrl: z.url().nullable().meta({ description: "The URL of the staff's image, if any." }),
  createdAt: z.iso.datetime().meta({ description: "When the staff was created." }),
  mediaCount: z
    .int()
    .meta({ description: "The number of medias the staff is linked to.", example: 3 }),
  roles: z
    .enum(STAFF_ROLES)
    .array()
    .meta({
      description: "The roles the staff holds on those medias.",
      examples: [["AUTHOR", "ARTIST"], ["ARTIST"]],
    }),
})

export const listManagedStaffsHandler = new Hono().get(
  "/managed",
  describeRoute({
    summary: "List staffs for management",
    description:
      "Lists the staffs for management, newest first, with the number of medias they are linked to and the roles they hold on them.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Staffs"],
    responses: {
      200: {
        description: "The matching staffs.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedStaffSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("staff.update"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search } = c.var.query
    const base = db
      .selectFrom("staffs")
      .where("staffs.deletedAt", "is", null)
      .where((eb) =>
        search === undefined ? eb.and([]) : eb("staffs.name", "ilike", `%${escapeLike(search)}%`),
      )
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "staffs.id",
          "staffs.name",
          "staffs.image",
          "staffs.createdAt",
          eb
            .selectFrom("mediaStaffs")
            .innerJoin("medias", "medias.id", "mediaStaffs.mediaId")
            .select(sql<number>`count(distinct "mediaStaffs"."mediaId")::int`.as("count"))
            .whereRef("mediaStaffs.staffId", "=", "staffs.id")
            .where("medias.deletedAt", "is", null)
            .as("mediaCount"),
        ])
        .orderBy("staffs.createdAt", "desc")
        .orderBy("staffs.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])
    const roles =
      rows.length === 0
        ? []
        : await db
            .selectFrom("mediaStaffs")
            .innerJoin("medias", "medias.id", "mediaStaffs.mediaId")
            .select(["mediaStaffs.staffId", "mediaStaffs.role"])
            .distinct()
            .where(
              "mediaStaffs.staffId",
              "in",
              rows.map((row) => row.id),
            )
            .where("medias.deletedAt", "is", null)
            .execute()
    const heldRoles = new Set(roles.map((entry) => `${entry.staffId}:${entry.role}`))

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        imageUrl: row.image === null ? null : getPublicImageUrl(row.image),
        createdAt: row.createdAt,
        mediaCount: row.mediaCount ?? 0,
        roles: STAFF_ROLES.filter((role) => heldRoles.has(`${row.id}:${role}`)),
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
