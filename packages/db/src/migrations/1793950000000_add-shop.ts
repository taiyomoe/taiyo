import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
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

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("shopPurchases").execute()
  await db.schema.dropType("ShopPurchaseType").execute()
}
