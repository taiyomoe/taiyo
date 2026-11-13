import { userAudit } from "@taiyomoe/audit"
import { COUNTRIES, GENDERS, LANGUAGES, SUPPORTED_LANGUAGES, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const MIN_AGE_YEARS = 13
const bodySchema = z.object({
  about: z
    .partialRecord(z.enum(SUPPORTED_LANGUAGES), z.string().trim().max(2000))
    .optional()
    .meta({ description: "About text, keyed by language. An empty string removes a language." }),
  city: z.string().trim().max(64).nullable().optional().meta({ example: "Lisbon" }),
  country: z.enum(COUNTRIES).nullable().optional().meta({ example: "pt" }),
  gender: z.enum(GENDERS).optional(),
  birthDate: z.iso
    .date()
    .nullable()
    .optional()
    .refine(
      (value) => {
        if (value === null || value === undefined) {
          return true
        }

        const limit = new Date()

        limit.setUTCFullYear(limit.getUTCFullYear() - MIN_AGE_YEARS)

        return new Date(value) <= limit && new Date(value) >= new Date("1900-01-01")
      },
      { message: `You must be at least ${MIN_AGE_YEARS} years old.` },
    )
    .meta({ description: "Birth date, as YYYY-MM-DD.", example: "1998-04-12" }),
})
const profileSchema = z.object({
  about: z.partialRecord(z.enum(LANGUAGES), z.string()),
  city: z.string().nullable(),
  country: z.enum(COUNTRIES).nullable(),
  gender: z.enum(GENDERS),
  birthDate: z.iso.date().nullable(),
})

export const updateMyProfileHandler = new Hono().patch(
  "/me/profile",
  describeRoute({
    summary: "Update my profile",
    description:
      "Updates the given fields of your public profile and leaves the others unchanged.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Profile updated.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(profileSchema)) } },
      },
      ...getOpenApiResponses({ 422: "The request data failed validation." }),
    },
  }),
  audited(userAudit.PROFILE_UPDATE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { about, city, country, gender, birthDate } = c.var.json
    const before = await db
      .selectFrom("userProfiles")
      .select([
        "about",
        "city",
        "country",
        "gender",
        sql<string | null>`to_char("birthDate", 'YYYY-MM-DD')`.as("birthDate"),
      ])
      .where("userId", "=", user.id)
      .forUpdate()
      .executeTakeFirst()
    const nextAbout =
      about === undefined
        ? undefined
        : Object.fromEntries(
            Object.entries({ ...before?.about, ...about }).filter(([, text]) => text !== ""),
          )
    const patch = {
      ...(nextAbout === undefined ? {} : { about: nextAbout }),
      ...(city === undefined ? {} : { city: city === "" ? null : city }),
      ...(country === undefined ? {} : { country }),
      ...(gender === undefined ? {} : { gender }),
      ...(birthDate === undefined ? {} : { birthDate }),
    }

    c.var.audit.set({ changes: auditChanges(before ?? {}, patch) })

    const updated = await db
      .insertInto("userProfiles")
      .values({ userId: user.id, ...patch })
      .onConflict((oc) => oc.column("userId").doUpdateSet(patch))
      .returning([
        "about",
        "city",
        "country",
        "gender",
        sql<string | null>`to_char("birthDate", 'YYYY-MM-DD')`.as("birthDate"),
      ])
      .executeTakeFirstOrThrow()

    return c.ok(updated)
  },
)
