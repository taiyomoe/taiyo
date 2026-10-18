import { type DB, type Kysely, sql } from "@taiyomoe/db"
import { ROLES } from "@taiyomoe/permissions"
import z from "zod"
import { userSummarySchema } from "./schemas"

const BAN_NOTE = "This account was banned."

export const managedUserSchema = userSummarySchema.extend({
  role: z.enum(ROLES),
  banned: z.boolean().meta({ description: "Whether the user is banned right now." }),
  banReason: z.string().nullable(),
  banExpires: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the ban ends, or null for a permanent ban." }),
  email: z
    .string()
    .nullable()
    .meta({ description: "The user's email address. Only admins see it." }),
  createdAt: z.iso.datetime(),
})

export const isBannedSql = sql<boolean>`coalesce("users"."banned", false) and ("users"."banExpires" is null or "users"."banExpires" > (CURRENT_TIMESTAMP at time zone 'UTC'))`

export const selectManagedUsers = (db: Kysely<DB>) =>
  db
    .selectFrom("users")
    .select([
      "users.id",
      "users.username",
      "users.displayUsername",
      "users.image",
      "users.role",
      "users.banReason",
      "users.email",
      "users.createdAt",
      isBannedSql.as("banned"),
      sql<string | null>`to_char("users"."banExpires", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
        "banExpires",
      ),
    ])

export const closePendingWork = async (
  db: Kysely<DB>,
  { userId, reviewerId }: { userId: string; reviewerId: string },
) => {
  const reviewedAt = sql<Date>`CURRENT_TIMESTAMP`
  const chapters = await db
    .selectFrom("chapters")
    .select(["id", "mediaId", "pages"])
    .where("uploaderId", "=", userId)
    .where("status", "=", "PENDING")
    .where("deletedAt", "is", null)
    .forUpdate()
    .execute()

  if (chapters.length > 0) {
    await db
      .updateTable("chapters")
      .set({
        status: "REJECTED",
        rejectionReason: BAN_NOTE,
        reviewerId,
        reviewedAt,
        pages: null,
      })
      .where(
        "id",
        "in",
        chapters.map((chapter) => chapter.id),
      )
      .execute()
  }

  await Promise.all([
    db
      .updateTable("mediaSuggestions")
      .set({ status: "REJECTED", reviewerId, reviewerNote: BAN_NOTE, reviewedAt })
      .where("authorId", "=", userId)
      .where("status", "=", "PENDING")
      .execute(),
    db
      .updateTable("groupOwnershipRequests")
      .set({ status: "REJECTED", reviewerId, reviewerNote: BAN_NOTE })
      .where("userId", "=", userId)
      .where("status", "=", "PENDING")
      .execute(),
    db
      .updateTable("groupCreationRequests")
      .set({ status: "REJECTED", reviewerId, reviewerNote: BAN_NOTE })
      .where("userId", "=", userId)
      .where("status", "=", "PENDING")
      .execute(),
    db
      .updateTable("groupInvitations")
      .set({ status: "CANCELLED" })
      .where("inviterId", "=", userId)
      .where("status", "=", "PENDING")
      .execute(),
    db.deleteFrom("sessions").where("userId", "=", userId).execute(),
  ])

  return chapters
}
