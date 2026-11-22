import { type Kysely, sql } from "kysely"

type MigrationDb = {
  users: { id: string; displayUsername: string; name: string; createdAt: Date }
}

// config.auth.displayName.maxLength when this migration was written.
const MAX_LENGTH = 30
const withSuffix = (base: string, suffix: string) =>
  `${base.slice(0, MAX_LENGTH - suffix.length)}${suffix}`

// Names that differ only by case may exist: the oldest account keeps its name.
export async function up(db: Kysely<MigrationDb>): Promise<void> {
  const rows = await db
    .selectFrom((ranked) =>
      ranked
        .selectFrom((base) =>
          base
            .selectFrom("users")
            .select((eb) => [
              "id",
              "displayUsername",
              "createdAt",
              eb.fn<string>("lower", ["displayUsername"]).as("lowered"),
            ])
            .as("base"),
        )
        .select((eb) => [
          "id",
          "displayUsername",
          "createdAt",
          eb.fn
            .agg<number>("row_number")
            .over((ob) => ob.partitionBy("lowered").orderBy("createdAt").orderBy("id"))
            .as("rank"),
        ])
        .as("ranked"),
    )
    .select(["id", "displayUsername"])
    .where("rank", ">", 1)
    .orderBy("createdAt")
    .orderBy("id")
    .execute()

  for (const row of rows) {
    for (let suffix = 2; ; suffix++) {
      const candidate = withSuffix(row.displayUsername, `_${suffix}`)
      const taken = await db
        .selectFrom("users")
        .select("id")
        .where((eb) =>
          eb(eb.fn("lower", ["displayUsername"]), "=", eb.fn("lower", [eb.val(candidate)])),
        )
        .executeTakeFirst()

      if (!taken) {
        await db
          .updateTable("users")
          .set({ displayUsername: candidate, name: candidate })
          .where("id", "=", row.id)
          .execute()

        break
      }
    }
  }

  await db.schema.dropIndex("users_displayUsername_key").execute()
  await db.schema
    .createIndex("users_displayUsername_lower_key")
    .on("users")
    .unique()
    .column(sql`lower("displayUsername")`)
    .execute()
}

// The renamed display names are not restored: that data change is irreversible.
export async function down(db: Kysely<MigrationDb>): Promise<void> {
  await db.schema.dropIndex("users_displayUsername_lower_key").execute()
  await db.schema
    .createIndex("users_displayUsername_key")
    .on("users")
    .column("displayUsername")
    .unique()
    .execute()
}
