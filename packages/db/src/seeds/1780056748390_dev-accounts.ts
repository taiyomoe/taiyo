import { hashPassword } from "@better-auth/utils/password"
import type { Kysely } from "kysely"
import type { DB } from "../database"

const PASSWORD = "password123"
const ACCOUNTS = [
  {
    id: "a850ab0e-de0a-4cb8-8592-9c9e1fb89bd5",
    name: "Test User",
    email: "user@gmail.com",
    username: "user",
    role: "USER",
  },
  {
    id: "33bf8ad7-0052-4241-9468-da2b2ef6c389",
    name: "Test Admin",
    email: "admin@gmail.com",
    username: "admin",
    role: "ADMIN",
  },
] as const

export async function seed(db: Kysely<DB>): Promise<void> {
  await db
    .insertInto("users")
    .values(
      ACCOUNTS.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        username: a.username,
        displayUsername: a.name,
        role: a.role,
        emailVerified: true,
      })),
    )
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("userProfiles")
    .values(ACCOUNTS.map((a) => ({ userId: a.id })))
    .onConflict((oc) => oc.column("userId").doNothing())
    .execute()

  await db
    .insertInto("accounts")
    .values(
      await Promise.all(
        ACCOUNTS.map(async (a) => ({
          providerId: "credential",
          accountId: a.id,
          userId: a.id,
          password: await hashPassword(PASSWORD),
        })),
      ),
    )
    .onConflict((oc) => oc.columns(["accountId", "providerId", "userId"]).doNothing())
    .execute()
}
