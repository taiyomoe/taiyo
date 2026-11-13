import { type Kysely, sql } from "kysely"

// Groups: memberships, ownership claims, member permissions, invitations, creation
// requests, follows and reports.

const PERMISSIONS = [
  "UPLOAD_CHAPTERS",
  "EDIT_CHAPTERS",
  "DELETE_CHAPTERS",
  "EDIT_GROUP",
  "MANAGE_MEMBERS",
]

export async function up(db: Kysely<unknown>): Promise<void> {
  // add-group-ownership
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

  // requireChapterAccess (group-ownership Phase 3) joins chapterGroups to
  // groupMemberships filtered by userId. The PK (userId, groupId) supports
  // lookups starting from userId already, but Postgres can pick the index
  // shape it prefers — making it explicit also unlocks the "what groups is
  // this user in?" query the design doc calls out.
  await db.schema
    .createIndex("groupMemberships_userId_idx")
    .on("groupMemberships")
    .column("userId")
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

  // add-group-member-permissions
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

  // add-group-invitations-and-requests
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

  // add-group-follows-and-reports
  await db.schema
    .createTable("groupFollows")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("groupId", "uuid", (c) =>
      c.notNull().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("groupFollows_pkey", ["userId", "groupId"])
    .execute()

  await db.schema
    .createIndex("groupFollows_groupId_idx")
    .on("groupFollows")
    .column("groupId")
    .execute()

  await db.schema
    .createType("GroupReportReason")
    .asEnum(["IMPERSONATION", "STOLEN_WORK", "SPAM", "OTHER"])
    .execute()

  await db.schema
    .createType("GroupReportStatus")
    .asEnum(["PENDING", "RESOLVED", "DISMISSED"])
    .execute()

  await db.schema
    .createTable("groupReports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("groupId", "uuid", (c) =>
      c.notNull().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reporterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reason", sql`"GroupReportReason"`, (c) => c.notNull())
    .addColumn("details", "text")
    .addColumn("status", sql`"GroupReportStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewerNote", "text")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await sql`
    CREATE UNIQUE INDEX "groupReports_pending_unique"
      ON "groupReports" ("groupId", "reporterId")
      WHERE "status" = 'PENDING'
  `.execute(db)

  await db.schema
    .createIndex("groupReports_status_createdAt_idx")
    .on("groupReports")
    .columns(["status", "createdAt"])
    .execute()

  await sql`
    CREATE TRIGGER "groupReports_set_updated_at"
    BEFORE UPDATE ON "groupReports"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)
}

export function down(): Promise<void> {
  return Promise.reject(
    new Error("add-group-features cannot be reversed: add-group-ownership destroy data"),
  )
}
