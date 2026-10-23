import { type Kysely, sql } from "kysely"

const PERMISSIONS = [
  "UPLOAD_CHAPTERS",
  "EDIT_CHAPTERS",
  "DELETE_CHAPTERS",
  "EDIT_GROUP",
  "MANAGE_MEMBERS",
]

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable("groupMemberships")
    .addColumn("permissions", sql`text[]`, (c) => c.notNull().defaultTo(sql`'{}'::text[]`))
    .execute()

  await db.schema
    .alterTable("groupMemberships")
    .addCheckConstraint(
      "groupMemberships_permissions_check",
      sql`"permissions" <@ ${sql.raw(`ARRAY[${PERMISSIONS.map((p) => `'${p}'`).join(", ")}]::text[]`)}`,
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable("groupMemberships").dropColumn("permissions").execute()
}
