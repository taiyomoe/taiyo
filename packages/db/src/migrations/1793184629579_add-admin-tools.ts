import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.createType("AuditOutcome").asEnum(["success", "failure", "denied"]).execute()

  await db.schema.createType("AuditActorType").asEnum(["user", "system", "api", "agent"]).execute()

  await db.schema
    .createType("AuditSeverity")
    .asEnum(["low", "medium", "high", "critical"])
    .execute()

  await db.schema
    .createTable("auditLogs")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("action", "text", (c) => c.notNull())
    .addColumn("outcome", sql`"AuditOutcome"`, (c) => c.notNull())
    .addColumn("severity", sql`"AuditSeverity"`)
    .addColumn("actorType", sql`"AuditActorType"`, (c) => c.notNull())
    .addColumn("actorId", "text", (c) => c.notNull())
    .addColumn("targetType", "text")
    .addColumn("targetId", "text")
    .addColumn("reason", "text")
    .addColumn("requestId", "text")
    .addColumn("ip", "text")
    .addColumn("userAgent", "text")
    .addColumn("idempotencyKey", "text")
    .addColumn("event", "jsonb", (c) => c.notNull())
    .execute()

  await sql`CREATE INDEX "auditLogs_createdAt_idx" ON "auditLogs" ("createdAt" DESC, id DESC)`.execute(
    db,
  )
  await sql`CREATE INDEX "auditLogs_actor_idx" ON "auditLogs" ("actorId", "createdAt" DESC)`.execute(
    db,
  )
  await sql`
    CREATE INDEX "auditLogs_target_idx" ON "auditLogs" ("targetType", "targetId", "createdAt" DESC)
  `.execute(db)
  await sql`CREATE INDEX "auditLogs_action_idx" ON "auditLogs" (action, "createdAt" DESC)`.execute(
    db,
  )

  await sql`
    CREATE FUNCTION audit_logs_reject_change() RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION 'auditLogs is append-only: % is not allowed', TG_OP;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE TRIGGER "auditLogs_append_only"
    BEFORE UPDATE OR DELETE ON "auditLogs"
    FOR EACH ROW
    EXECUTE FUNCTION audit_logs_reject_change()
  `.execute(db)

  await sql`
    CREATE TRIGGER "auditLogs_no_truncate"
    BEFORE TRUNCATE ON "auditLogs"
    FOR EACH STATEMENT
    EXECUTE FUNCTION audit_logs_reject_change()
  `.execute(db)

  await db.schema
    .createIndex("userHistories_createdAt_idx")
    .on("userHistories")
    .column("createdAt")
    .execute()

  await db.schema
    .createIndex("userLibraryEntries_createdAt_idx")
    .on("userLibraryEntries")
    .column("createdAt")
    .execute()

  await db.schema.createIndex("chapters_createdAt_idx").on("chapters").column("createdAt").execute()

  await db.schema.createIndex("covers_createdAt_idx").on("covers").column("createdAt").execute()

  await db.schema.createIndex("medias_createdAt_idx").on("medias").column("createdAt").execute()

  await db.schema.createIndex("users_createdAt_idx").on("users").column("createdAt").execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("userHistories_createdAt_idx").execute()

  await db.schema.dropIndex("userLibraryEntries_createdAt_idx").execute()

  await db.schema.dropIndex("chapters_createdAt_idx").execute()

  await db.schema.dropIndex("covers_createdAt_idx").execute()

  await db.schema.dropIndex("medias_createdAt_idx").execute()

  await db.schema.dropIndex("users_createdAt_idx").execute()

  await db.schema.dropTable("auditLogs").execute()
  await sql`DROP FUNCTION audit_logs_reject_change()`.execute(db)
  await db.schema.dropType("AuditSeverity").execute()
  await db.schema.dropType("AuditActorType").execute()
  await db.schema.dropType("AuditOutcome").execute()
}
