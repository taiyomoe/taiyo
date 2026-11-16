import {
  AVATAR_BORDERS,
  type CosmeticDefinition,
  type DB,
  type Kysely,
  NAME_EFFECTS,
  type Role,
  USER_TITLES,
} from "@taiyomoe/db"

// Cosmetics granted by a role the user no longer holds, which equipping would now refuse.
const lockedFor = (catalog: Record<string, CosmeticDefinition>, role: Role) =>
  Object.entries(catalog)
    .filter(([, { unlock }]) => unlock.type === "role" && !unlock.roles.includes(role))
    .map(([key]) => key)

/**
 * Gives the users a role and unequips the cosmetics it does not unlock.
 * The caller refreshes their sessions, so the role applies to their very next request.
 */
export const setUsersRole = async (db: Kysely<DB>, userIds: readonly string[], role: Role) => {
  if (userIds.length === 0) {
    return
  }

  await db.updateTable("users").set({ role }).where("id", "in", userIds).execute()
  await Promise.all([
    db
      .updateTable("users")
      .set({ nameEffect: null })
      .where("id", "in", userIds)
      .where((eb) => {
        const locked = lockedFor(NAME_EFFECTS, role)

        return locked.length === 0 ? eb.lit(false) : eb("nameEffect", "in", locked)
      })
      .execute(),
    db
      .updateTable("users")
      .set({ avatarBorder: null })
      .where("id", "in", userIds)
      .where((eb) => {
        const locked = lockedFor(AVATAR_BORDERS, role)

        return locked.length === 0 ? eb.lit(false) : eb("avatarBorder", "in", locked)
      })
      .execute(),
    db
      .updateTable("userProfiles")
      .set({ title: null })
      .where("userId", "in", userIds)
      .where((eb) => {
        const locked = lockedFor(USER_TITLES, role)

        return locked.length === 0 ? eb.lit(false) : eb("title", "in", locked)
      })
      .execute(),
  ])
}
