import type { Kysely } from "kysely"
import { hashPassword } from "@better-auth/utils/password"
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
  {
    id: "5b0d2f9e-6c1a-4f43-9d7e-1a8c3b2e4f60",
    name: "Test Moderator",
    email: "moderator@gmail.com",
    username: "moderator",
    role: "MODERATOR",
  },
  {
    id: "8e4a6c21-3b7d-4e95-a0f2-6d1c9b8e7a43",
    name: "Test Uploader",
    email: "uploader@gmail.com",
    username: "uploader",
    role: "UPLOADER",
  },
  {
    id: "c3f19a7e-52d8-4b06-8e4c-7a2d1f6b9e05",
    name: "Test Intern",
    email: "intern@gmail.com",
    username: "intern",
    role: "UPLOADER_INTERN",
  },
  {
    id: "2a7e5d93-8f1c-4b6a-9e30-c4d8b1f2a7e6",
    name: "Test Group Owner",
    email: "owner@gmail.com",
    username: "owner",
    role: "USER",
  },
  {
    id: "f6b8c2d4-1e3a-4c57-b9d0-8a2e6f4c1b37",
    name: "Test Group Member",
    email: "member@gmail.com",
    username: "member",
    role: "USER",
  },
] as const
const ADMIN_ID = "33bf8ad7-0052-4241-9468-da2b2ef6c389"
const DEV_GROUP_ID = "9d3e7b1a-4c6f-4a28-b5e9-2f8c1d7a6b40"
const MEMBERSHIPS = [
  { userId: "2a7e5d93-8f1c-4b6a-9e30-c4d8b1f2a7e6", role: "OWNER", permissions: [] },
  {
    userId: "f6b8c2d4-1e3a-4c57-b9d0-8a2e6f4c1b37",
    role: "MEMBER",
    permissions: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
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

  await db
    .insertInto("groups")
    .values({ id: DEV_GROUP_ID, name: "Taiyō Dev Scans", creatorId: ADMIN_ID })
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("groupMemberships")
    .values(
      MEMBERSHIPS.map((membership) => ({
        ...membership,
        permissions: [...membership.permissions],
        groupId: DEV_GROUP_ID,
        addedBy: ADMIN_ID,
      })),
    )
    .onConflict((oc) => oc.columns(["userId", "groupId"]).doNothing())
    .execute()
}
