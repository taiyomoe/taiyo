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
    .meta({
      description:
        "The about text of your profile, keyed by language. Languages you omit stay unchanged, and an empty string removes a language.",
      example: { en: "Reading isekai since 2015." },
    }),
  city: z.string().trim().max(64).nullable().optional().meta({
    description: "The city you live in, or null or an empty string to remove it.",
    example: "Lisbon",
  }),
  country: z.enum(COUNTRIES).nullable().optional().meta({
    description: "The country you live in, as a lowercase ISO 3166-1 code, or null to remove it.",
    example: "pt",
  }),
  gender: z.enum(GENDERS).optional().meta({ description: "Your gender.", example: "FEMALE" }),
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
    .meta({
      description: `Your birth date, or null to remove it. You must be at least ${MIN_AGE_YEARS} years old.`,
      example: "1998-04-12",
    }),
})
const profileSchema = z.object({
  about: z.partialRecord(z.enum(LANGUAGES), z.string()).meta({
    description: "The about text of your profile, keyed by language.",
    example: { en: "Reading isekai since 2015." },
  }),
  city: z
    .string()
    .nullable()
    .meta({ description: "The city you live in, if any.", example: "Lisbon" }),
  country: z
    .enum(COUNTRIES)
    .nullable()
    .meta({ description: "The country you live in, if any.", example: "pt" }),
  gender: z.enum(GENDERS).meta({ description: "Your gender.", example: "FEMALE" }),
  birthDate: z.iso
    .date()
    .nullable()
    .meta({ description: "Your birth date, if any.", example: "1998-04-12" }),
})

export const updateMyProfileHandler = new Hono().patch(
  "/me/profile",
  describeRoute({
    summary: "Update my profile",
    description:
      "Updates the given fields of your public profile and leaves the others unchanged.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    responses: {
      200: {
        description: "Profile updated.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(profileSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
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
    const row = { userId: user.id, ...patch }

    c.var.audit.set({ changes: auditChanges(before ?? {}, patch) })

    const updated = await db
      .insertInto("userProfiles")
      .values(row)
      .onConflict((oc) => oc.column("userId").doUpdateSet(row))
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
