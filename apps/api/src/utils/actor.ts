import type { DB, Kysely } from "@taiyomoe/db"
import { type Actor, toRole } from "@taiyomoe/permissions"

export const loadActor = async (db: Kysely<DB>, userId: string): Promise<Actor | null> => {
  const [user, memberships] = await Promise.all([
    db.selectFrom("users").select(["role", "banned"]).where("id", "=", userId).executeTakeFirst(),
    db
      .selectFrom("groupMemberships")
      .innerJoin("groups", "groups.id", "groupMemberships.groupId")
      .select(["groupMemberships.groupId", "groupMemberships.role", "groupMemberships.permissions"])
      .where("groupMemberships.userId", "=", userId)
      .where("groups.deletedAt", "is", null)
      .execute(),
  ])

  if (user === undefined) {
    return null
  }

  return { id: userId, role: toRole(user.role), banned: user.banned === true, memberships }
}
