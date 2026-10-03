import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType("GroupMembershipRole").asEnum(["OWNER", "MEMBER"]).execute()

  await db.schema
    .createType("GroupOwnershipRequestStatus")
    .asEnum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"])
    .execute()

  // groupMemberships: many-to-many between users and groups, with a role.
  await db.schema
    .createTable("groupMemberships")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("groupId", "uuid", (c) =>
      c.notNull().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("role", sql`"GroupMembershipRole"`, (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("addedBy", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("groupMemberships_pkey", ["userId", "groupId"])
    .execute()

  await db.schema
    .createIndex("groupMemberships_groupId_role_idx")
    .on("groupMemberships")
    .columns(["groupId", "role"])
    .execute()

  // groupOwnershipRequests: workflow + audit log for claim requests.
  await db.schema
    .createTable("groupOwnershipRequests")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("groupId", "uuid", (c) =>
      c.notNull().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("status", sql`"GroupOwnershipRequestStatus"`, (c) =>
      c.notNull().defaultTo("PENDING"),
    )
    .addColumn("message", "text")
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewerNote", "text")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  // At most one pending request per (user, group) at a time.
  await sql`
    CREATE UNIQUE INDEX "groupOwnershipRequests_pending_unique"
      ON "groupOwnershipRequests" ("userId", "groupId")
      WHERE "status" = 'PENDING'
  `.execute(db)

  await sql`
    CREATE TRIGGER "groupOwnershipRequests_set_updated_at"
    BEFORE UPDATE ON "groupOwnershipRequests"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)
}

export async function down(): Promise<void> {
  throw new Error("add-group-ownership cannot be reversed")
}
