import { type Kysely, sql } from "kysely"

// Profiles: customization, two-factor authentication and the points shop.

export async function up(db: Kysely<unknown>): Promise<void> {
  // add-profile-customization
  await db.schema.alterTable("users").addColumn("nameEffect", "text").execute()
  await db.schema.alterTable("users").addColumn("avatarBorder", "text").execute()
  await db.schema.alterTable("userProfiles").addColumn("title", "text").execute()

  await db.schema
    .createType("UserCosmeticKind")
    .asEnum(["NAME_EFFECT", "TITLE", "AVATAR_BORDER"])
    .execute()

  await db.schema
    .createTable("userCosmetics")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("kind", sql`"UserCosmeticKind"`, (c) => c.notNull())
    .addColumn("key", "text", (c) => c.notNull())
    .addColumn("acquiredAt", sql`timestamp(3)`, (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addPrimaryKeyConstraint("userCosmetics_pkey", ["userId", "kind", "key"])
    .execute()

  await sql`
    CREATE INDEX "chapters_uploaderId_createdAt_idx"
      ON "chapters" ("uploaderId", "createdAt" DESC)
      WHERE "deletedAt" IS NULL
  `.execute(db)

  // add-two-factor
  await db.schema
    .alterTable("users")
    .addColumn("twoFactorEnabled", "boolean", (c) => c.notNull().defaultTo(false))
    .execute()

  await db.schema
    .createTable("twoFactors")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("secret", "text", (c) => c.notNull())
    .addColumn("backupCodes", "text", (c) => c.notNull())
    .addColumn("verified", "boolean", (c) => c.notNull().defaultTo(true))
    .addColumn("failedVerificationCount", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("lockedUntil", sql`timestamp(3)`)
    .execute()

  await db.schema.createIndex("twoFactors_userId_idx").on("twoFactors").column("userId").execute()
  await db.schema.createIndex("twoFactors_secret_idx").on("twoFactors").column("secret").execute()

  // add-shop
  await db.schema.createType("ShopPurchaseType").asEnum(["ITEM", "LOOT_BOX"]).execute()

  await db.schema
    .createTable("shopPurchases")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("type", sql`"ShopPurchaseType"`, (c) => c.notNull())
    .addColumn("lootBox", "text")
    .addColumn("cosmeticKind", sql`"UserCosmeticKind"`, (c) => c.notNull())
    .addColumn("cosmeticKey", "text", (c) => c.notNull())
    .addColumn("price", "integer", (c) => c.notNull().check(sql`"price" > 0`))
    .addColumn("refund", "integer", (c) =>
      c
        .notNull()
        .defaultTo(0)
        .check(sql`"refund" >= 0`),
    )
    .addColumn("duplicate", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addCheckConstraint(
      "shopPurchases_lootBox_check",
      sql`("type" = 'LOOT_BOX') = ("lootBox" IS NOT NULL)`,
    )
    .addCheckConstraint("shopPurchases_refund_below_price_check", sql`"refund" < "price"`)
    .execute()

  await db.schema
    .createIndex("shopPurchases_userId_createdAt_idx")
    .on("shopPurchases")
    .columns(["userId", "createdAt desc"])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // add-shop
  await db.schema.dropTable("shopPurchases").execute()
  await db.schema.dropType("ShopPurchaseType").execute()

  // add-two-factor
  await db.schema.dropTable("twoFactors").execute()
  await db.schema.alterTable("users").dropColumn("twoFactorEnabled").execute()

  // add-profile-customization
  await sql`DROP INDEX IF EXISTS "chapters_uploaderId_createdAt_idx"`.execute(db)
  await db.schema.dropTable("userCosmetics").execute()
  await db.schema.dropType("UserCosmeticKind").execute()
  await db.schema.alterTable("userProfiles").dropColumn("title").execute()
  await db.schema.alterTable("users").dropColumn("avatarBorder").execute()
  await db.schema.alterTable("users").dropColumn("nameEffect").execute()
}
