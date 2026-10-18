import { GROUP_PERMISSIONS, type GroupPermission, ROLES, type Role } from "@taiyomoe/db/constants"
import { createRules } from "permix"
import type { Actor, PermissionsDefinition } from "./definition"

const NO_PERMISSIONS: ReadonlySet<GroupPermission> = new Set()
const ALL_PERMISSIONS: ReadonlySet<GroupPermission> = new Set(GROUP_PERMISSIONS)

export const toRole = (value: unknown) => ROLES.find((role) => role === value) ?? "USER"

export const buildRules = (actor: Actor | null) => {
  const active = actor?.banned === false ? actor : null
  const is = (...roles: Role[]) => active !== null && roles.includes(active.role)
  const isSelf = (userId: string) => active?.id === userId
  const memberships = new Map(active?.memberships.map((m) => [m.groupId, m]))
  const permissionsIn = (groupId: string) => {
    const membership = memberships.get(groupId)

    if (membership === undefined) {
      return NO_PERMISSIONS
    }

    return membership.role === "OWNER" ? ALL_PERMISSIONS : new Set(membership.permissions)
  }
  const holds = (groupId: string, permission: GroupPermission) =>
    permissionsIn(groupId).has(permission)
  const holdsInAny = (groupIds: readonly string[], permission: GroupPermission) =>
    groupIds.some((groupId) => holds(groupId, permission))
  const isOwner = (groupId: string) => memberships.get(groupId)?.role === "OWNER"
  const managesChapters = is("UPLOADER", "MODERATOR", "ADMIN")
  const canManage = (groupId: string, permissions: readonly GroupPermission[]) => {
    if (!holds(groupId, "MANAGE_MEMBERS") || permissions.includes("MANAGE_MEMBERS")) {
      return false
    }

    const own = permissionsIn(groupId)

    return permissions.every((p) => own.has(p))
  }

  return createRules<PermissionsDefinition>({
    dashboard: {
      open: active !== null,
      viewStats: is("MODERATOR", "ADMIN"),
    },
    media: {
      create: is("UPLOADER_INTERN", "UPLOADER", "ADMIN"),
      update: is("UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"),
      delete: is("UPLOADER", "ADMIN"),
      restore: is("ADMIN"),
      flag: is("MODERATOR", "ADMIN"),
      reindex: is("ADMIN"),
    },
    staff: {
      create: is("UPLOADER_INTERN", "UPLOADER", "ADMIN"),
      update: is("UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"),
      delete: is("UPLOADER", "ADMIN"),
    },
    chapter: {
      publish: is("UPLOADER", "ADMIN"),
      flag: managesChapters,
      update: (chapter) => managesChapters || holdsInAny(chapter.groupIds, "EDIT_CHAPTERS"),
      delete: (chapter) => managesChapters || holdsInAny(chapter.groupIds, "DELETE_CHAPTERS"),
      credit: ({ chapter }) => managesChapters || holdsInAny(chapter.groupIds, "EDIT_CHAPTERS"),
      uncredit: ({ chapter, groupId }) =>
        managesChapters || (chapter.groupIds.includes(groupId) && holds(groupId, "EDIT_CHAPTERS")),
    },
    group: {
      create: is("UPLOADER", "ADMIN"),
      delete: is("ADMIN"),
      update: (group) => is("UPLOADER", "MODERATOR", "ADMIN") || holds(group.id, "EDIT_GROUP"),
      uploadChapters: (group) => holds(group.id, "UPLOAD_CHAPTERS"),
      manageMembers: (group) => is("ADMIN") || holds(group.id, "MANAGE_MEMBERS"),
      transferOwnership: (group) => isOwner(group.id),
      inviteMember: ({ groupId, permissions }) =>
        is("ADMIN") || isOwner(groupId) || canManage(groupId, permissions),
      updateMember: ({ member, permissions }) => {
        if (is("ADMIN")) {
          return true
        }

        if (member.role !== "MEMBER") {
          return false
        }

        if (isOwner(member.groupId)) {
          return true
        }

        return (
          !isSelf(member.userId) &&
          canManage(member.groupId, member.permissions) &&
          canManage(
            member.groupId,
            GROUP_PERMISSIONS.filter(
              (p) => member.permissions.includes(p) !== permissions.includes(p),
            ),
          )
        )
      },
      removeMember: (member) => {
        if (is("ADMIN")) {
          return true
        }

        if (member.role !== "MEMBER" || isSelf(member.userId)) {
          return false
        }

        return isOwner(member.groupId) || canManage(member.groupId, member.permissions)
      },
      promoteMember: (member) =>
        member.role === "MEMBER" && (is("ADMIN") || isOwner(member.groupId)),
      demoteMember: (member) =>
        member.role === "OWNER" &&
        (is("ADMIN") || (isOwner(member.groupId) && isSelf(member.userId))),
    },
    ownershipRequest: {
      create: active !== null,
      review: is("ADMIN"),
    },
    groupCreationRequest: {
      create: active !== null,
      review: is("ADMIN"),
    },
    comment: {
      delete: is("MODERATOR", "ADMIN"),
    },
    user: {
      list: is("MODERATOR", "ADMIN"),
      ban: (target) =>
        !isSelf(target.id) && (is("ADMIN") || (is("MODERATOR") && target.role === "USER")),
      setRole: (target) => is("ADMIN") && !isSelf(target.id),
    },
  })
}
