import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability"
import type { User } from "@taiyomoe/auth/server"

export type Actions = "create" | "read" | "update" | "delete" | "manage"

export type Subjects = "Media" | "Staff" | "all"

export type AppAbility = MongoAbility<[Actions, Subjects]>

export const defineAbilitiesFor = (user: User): AppAbility => {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (user.banned) {
    return build()
  }

  if (user.role === "ADMIN") {
    can("manage", "all")
  }

  if (user.role === "MODERATOR") {
    can("manage", ["Media", "Staff"])
  }

  if (user.role === "UPLOADER" || user.role === "UPLOADER_INTERN") {
    can(["create", "update", "delete"], "Media")
    can("manage", "Staff")
  }

  return build()
}
