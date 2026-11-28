import type { Kysely } from "kysely"

type MigrationDb = {
  users: {
    id: string
    name: string
    username: string
    displayUsername: string
    emailVerified: boolean
    role: string
    banned: boolean
    banReason: string
  }
  userProfiles: { userId: string }
}

// DELETED_USER_ID when this migration was written.
const DELETED_USER_ID = "00000000-0000-4000-8000-0000000de1e7"

// No username a person can pick contains a hyphen, so "deleted-user" is always free. The display
// name can be taken: like 1795309019827_case-insensitive-display-names, its holder gets a suffix.
export async function up(db: Kysely<MigrationDb>): Promise<void> {
  const holder = await db
    .selectFrom("users")
    .select("id")
    .where((eb) => eb(eb.fn("lower", ["displayUsername"]), "=", "deleted user"))
    .executeTakeFirst()

  if (holder !== undefined) {
    for (let suffix = 2; ; suffix++) {
      const candidate = `Deleted user_${suffix}`
      const taken = await db
        .selectFrom("users")
        .select("id")
        .where((eb) => eb(eb.fn("lower", ["displayUsername"]), "=", candidate.toLowerCase()))
        .executeTakeFirst()

      if (taken === undefined) {
        await db
          .updateTable("users")
          .set({ displayUsername: candidate, name: candidate })
          .where("id", "=", holder.id)
          .execute()

        break
      }
    }
  }

  await db
    .insertInto("users")
    .values({
      id: DELETED_USER_ID,
      name: "Deleted user",
      username: "deleted-user",
      displayUsername: "Deleted user",
      emailVerified: false,
      role: "USER",
      banned: true,
      banReason: "Stands in for deleted accounts",
    })
    .execute()
  await db.insertInto("userProfiles").values({ userId: DELETED_USER_ID }).execute()
}

export async function down(db: Kysely<MigrationDb>): Promise<void> {
  await db.deleteFrom("userProfiles").where("userId", "=", DELETED_USER_ID).execute()
  await db.deleteFrom("users").where("id", "=", DELETED_USER_ID).execute()
}
