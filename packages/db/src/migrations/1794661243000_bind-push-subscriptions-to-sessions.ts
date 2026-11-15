import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  // A subscription now lives as long as the session that registered it. Existing rows have no
  // session to belong to: the web registers each device's subscription again on its next visit.
  await sql`DELETE FROM "pushSubscriptions"`.execute(db)

  await db.schema
    .alterTable("pushSubscriptions")
    .addColumn("sessionId", "uuid", (c) =>
      c.notNull().references("sessions.id").onDelete("cascade").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("pushSubscriptions_sessionId_idx")
    .on("pushSubscriptions")
    .column("sessionId")
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("pushSubscriptions").dropColumn("sessionId").execute()
}
