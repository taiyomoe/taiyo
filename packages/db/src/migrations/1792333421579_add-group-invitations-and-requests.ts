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
    .createType("GroupInvitationStatus")
    .asEnum(["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "EXPIRED"])
    .execute()

  await db.schema
    .createTable("groupInvitations")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("groupId", "uuid", (c) =>
      c.notNull().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("inviteeId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("inviterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("permissions", sql`text[]`, (c) => c.notNull().defaultTo(sql`'{}'::text[]`))
    .addColumn("status", sql`"GroupInvitationStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("expiresAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addCheckConstraint(
      "groupInvitations_permissions_check",
      sql`"permissions" <@ ${sql.raw(`ARRAY[${PERMISSIONS.map((p) => `'${p}'`).join(", ")}]::text[]`)}`,
    )
    .execute()

  await sql`
    CREATE UNIQUE INDEX "groupInvitations_pending_unique"
      ON "groupInvitations" ("groupId", "inviteeId")
      WHERE "status" = 'PENDING'
  `.execute(db)

  await db.schema
    .createIndex("groupInvitations_inviteeId_status_idx")
    .on("groupInvitations")
    .columns(["inviteeId", "status"])
    .execute()

  await sql`
    CREATE TRIGGER "groupInvitations_set_updated_at"
    BEFORE UPDATE ON "groupInvitations"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  await db.schema
    .alterTable("groupOwnershipRequests")
    .addColumn("proofLinks", sql`text[]`, (c) => c.notNull().defaultTo(sql`'{}'::text[]`))
    .execute()

  await db.schema
    .createIndex("groupOwnershipRequests_status_createdAt_idx")
    .on("groupOwnershipRequests")
    .columns(["status", "createdAt"])
    .execute()

  await db.schema
    .createTable("groupCreationRequests")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("description", "text")
    .addColumn("proofLinks", sql`text[]`, (c) => c.notNull().defaultTo(sql`'{}'::text[]`))
    .addColumn("message", "text", (c) => c.notNull())
    .addColumn("status", sql`"GroupOwnershipRequestStatus"`, (c) =>
      c.notNull().defaultTo("PENDING"),
    )
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewerNote", "text")
    .addColumn("groupId", "uuid", (c) =>
      c.references("groups.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .createIndex("groupCreationRequests_status_createdAt_idx")
    .on("groupCreationRequests")
    .columns(["status", "createdAt"])
    .execute()

  await db.schema
    .createIndex("groupCreationRequests_userId_idx")
    .on("groupCreationRequests")
    .column("userId")
    .execute()

  await sql`
    CREATE TRIGGER "groupCreationRequests_set_updated_at"
    BEFORE UPDATE ON "groupCreationRequests"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("groupCreationRequests").execute()
  await db.schema.dropIndex("groupOwnershipRequests_status_createdAt_idx").execute()
  await db.schema.alterTable("groupOwnershipRequests").dropColumn("proofLinks").execute()
  await db.schema.dropTable("groupInvitations").execute()
  await db.schema.dropType("GroupInvitationStatus").execute()
}
