import { type DB, type Kysely, sql } from "@taiyomoe/db"

export const isGroupNameTaken = async (db: Kysely<DB>, name: string) => {
  const row = await db
    .selectFrom("groups")
    .select("id")
    .where(sql<string>`lower("name")`, "=", name.toLowerCase())
    .where("deletedAt", "is", null)
    .limit(1)
    .executeTakeFirst()

  return row !== undefined
}
