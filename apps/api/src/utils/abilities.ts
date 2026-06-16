import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability"
import type { User } from "@taiyomoe/auth/server"

export type Actions = "create" | "read" | "update" | "delete" | "manage"

export type Subjects = "Media" | "Staff" | "Chapter" | "Group" | "OwnershipRequest" | "all"

export type AppAbility = MongoAbility<[Actions, Subjects]>

export const defineAbilitiesFor = (user: User): AppAbility => {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (user.banned) {
    return build()
  }

  // Any non-banned user can ask to own a group, view their requests, or
  // cancel their own. The handler enforces ownership of the request row.
  can(["create", "read", "delete"], "OwnershipRequest")

  if (user.role === "ADMIN") {
    can("manage", "all")
  }

  if (user.role === "MODERATOR") {
    can("manage", ["Media", "Staff", "Chapter", "Group", "OwnershipRequest"])
  }

  if (user.role === "UPLOADER" || user.role === "UPLOADER_INTERN") {
    can(["create", "update", "delete"], "Media")
    can("manage", ["Staff", "Chapter", "Group"])
  }

  return build()
}
