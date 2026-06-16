import type { DB, Kysely } from "@taiyomoe/db"
import type { User } from "better-auth"

export const createAfterUserCreatedHook =
  ({ db }: { db: Kysely<DB> }) =>
  async ({ id }: User) => {
    await db.insertInto("userProfiles").values({ userId: id }).execute()
  }
