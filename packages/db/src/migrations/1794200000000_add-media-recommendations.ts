import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType("MediaRelationType")
    .asEnum([
      "PREQUEL",
      "SEQUEL",
      "MAIN_STORY",
      "SIDE_STORY",
      "ORIGINAL",
      "ADAPTATION",
      "ALTERNATE_VERSION",
      "ALTERNATE_STORY",
      "SAME_FRANCHISE",
    ])
    .execute()

  await db.schema
    .createTable("mediaRelations")
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("relatedMediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("type", sql`"MediaRelationType"`, (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("mediaRelations_pkey", ["mediaId", "relatedMediaId"])
    .addCheckConstraint("mediaRelations_distinct_check", sql`"mediaId" <> "relatedMediaId"`)
    .execute()

  await db.schema
    .createIndex("mediaRelations_relatedMediaId_idx")
    .on("mediaRelations")
    .column("relatedMediaId")
    .execute()

  await db.schema
    .createTable("mediaRelationSyncs")
    .addColumn("mediaId", "uuid", (c) =>
      c.primaryKey().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("syncedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .createTable("mediaSimilarities")
    .addColumn("mediaId", "uuid", (c) =>
      c.primaryKey().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("items", "jsonb", (c) => c.notNull())
    .addColumn("computedAt", sql`timestamp(3)`, (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute()

  await db.schema.createType("RecommendationSurface").asEnum(["RELATED", "FOR_YOU"]).execute()

  await db.schema
    .createTable("recommendationImpressions")
    .addColumn("id", "bigint", (c) => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn("surface", sql`"RecommendationSurface"`, (c) => c.notNull())
    .addColumn("sourceMediaId", "uuid", (c) =>
      c.references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaIds", sql`uuid[]`, (c) => c.notNull())
    .addColumn("userId", "uuid", (c) =>
      c.references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .createTable("recommendationClicks")
    .addColumn("id", "bigint", (c) => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn("surface", sql`"RecommendationSurface"`, (c) => c.notNull())
    .addColumn("sourceMediaId", "uuid", (c) =>
      c.references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("position", "smallint", (c) => c.notNull())
    .addColumn("userId", "uuid", (c) =>
      c.references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  for (const table of ["recommendationImpressions", "recommendationClicks"]) {
    await db.schema.createIndex(`${table}_createdAt_idx`).on(table).column("createdAt").execute()
    await db.schema.createIndex(`${table}_userId_idx`).on(table).column("userId").execute()
    await db.schema
      .createIndex(`${table}_sourceMediaId_idx`)
      .on(table)
      .column("sourceMediaId")
      .execute()
  }

  await db.schema
    .createIndex("recommendationClicks_mediaId_idx")
    .on("recommendationClicks")
    .column("mediaId")
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("recommendationClicks").execute()
  await db.schema.dropTable("recommendationImpressions").execute()
  await db.schema.dropType("RecommendationSurface").execute()
  await db.schema.dropTable("mediaSimilarities").execute()
  await db.schema.dropTable("mediaRelationSyncs").execute()
  await db.schema.dropTable("mediaRelations").execute()
  await db.schema.dropType("MediaRelationType").execute()
}
