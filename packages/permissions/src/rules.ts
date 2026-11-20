import { GROUP_PERMISSIONS, type GroupPermission, ROLES, type Role } from "@taiyomoe/db/constants"
import { createRules } from "permix"
import type {
  Actor,
  ChapterTarget,
  ListTarget,
  MediaSuggestionTarget,
  PermissionsDefinition,
  UserTarget,
} from "./definition"

const NO_PERMISSIONS: ReadonlySet<GroupPermission> = new Set()
const ALL_PERMISSIONS: ReadonlySet<GroupPermission> = new Set(GROUP_PERMISSIONS)

export const toRole = (value: unknown) => ROLES.find((role) => role === value) ?? "USER"

/** The group permissions that give a hand on the group's chapters. */
const CHAPTER_GROUP_PERMISSIONS: readonly GroupPermission[] = [
  "UPLOAD_CHAPTERS",
  "EDIT_CHAPTERS",
  "DELETE_CHAPTERS",
]

/** The groups whose chapters the actor uploads, edits or deletes: owned ones, or ones granting a chapter permission. */
export const getChapterGroupIds = (actor: Actor | null) =>
  actor === null || actor.banned
    ? []
    : actor.memberships
        .filter(
          (membership) =>
            membership.role === "OWNER" ||
            membership.permissions.some((permission) =>
              CHAPTER_GROUP_PERMISSIONS.includes(permission),
            ),
        )
        .map((membership) => membership.groupId)

export const buildRules = (actor: Actor | null) => {
  const active = actor?.banned === false ? actor : null
  const is = (...roles: Role[]) => active !== null && roles.includes(active.role)
  const isSelf = (userId: string) => active?.id === userId
  const actsForUser = (target: UserTarget) =>
    is("ADMIN") && !isSelf(target.id) && target.role !== "ADMIN"
  const moderatesUser = (target: UserTarget) =>
    !isSelf(target.id) && (is("ADMIN") || (is("MODERATOR") && target.role === "USER"))
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
  const reviewsChapters = is("UPLOADER", "ADMIN")
  const reviewsSuggestions = is("UPLOADER", "MODERATOR", "ADMIN")
  const moderatesLists = is("MODERATOR", "ADMIN")
  // Staff moderate what everyone can see: a `PRIVATE` list stays its owner's alone.
  const managesList = (list: ListTarget) =>
    isSelf(list.userId) || (moderatesLists && list.visibility === "PUBLIC")
  const isOwnPendingSuggestion = (suggestion: MediaSuggestionTarget) =>
    suggestion.status === "PENDING" && isSelf(suggestion.authorId)
  const isLive = (chapter: ChapterTarget) =>
    chapter.status === "PUBLISHED" || chapter.status === "SCHEDULED"
  const isInternsOwn = (chapter: ChapterTarget) =>
    is("UPLOADER_INTERN") && isSelf(chapter.uploaderId)
  const isOwnUnpublished = (chapter: ChapterTarget) =>
    (chapter.status === "PENDING" || chapter.status === "UPLOADING") && isSelf(chapter.uploaderId)
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
      suggest: active !== null,
      delete: is("UPLOADER", "ADMIN"),
      restore: is("ADMIN"),
      merge: is("ADMIN"),
      flag: is("MODERATOR", "ADMIN"),
      reindex: is("ADMIN"),
      syncMangaDex: is("UPLOADER", "ADMIN"),
      feature: is("ADMIN"),
    },
    mediaSuggestion: {
      review: reviewsSuggestions,
      view: (suggestion) => reviewsSuggestions || isSelf(suggestion.authorId),
      update: isOwnPendingSuggestion,
      withdraw: isOwnPendingSuggestion,
    },
    staff: {
      create: is("UPLOADER_INTERN", "UPLOADER", "ADMIN"),
      update: is("UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"),
      delete: is("UPLOADER", "ADMIN"),
    },
    chapter: {
      publish: is("UPLOADER_INTERN", "UPLOADER", "ADMIN"),
      submit: active !== null,
      review: reviewsChapters,
      flag: managesChapters,
      list: managesChapters,
      // Seeing every chapter includes seeing the ones of one's groups.
      listInGroups:
        managesChapters || is("UPLOADER_INTERN") || getChapterGroupIds(active).length > 0,
      view: (chapter) => {
        if (chapter.status === "PUBLISHED") {
          return true
        }

        return (
          reviewsChapters ||
          isSelf(chapter.uploaderId) ||
          (chapter.status === "SCHEDULED" &&
            (managesChapters || holdsInAny(chapter.groupIds, "EDIT_CHAPTERS")))
        )
      },
      update: (chapter) =>
        isLive(chapter)
          ? managesChapters ||
            isInternsOwn(chapter) ||
            holdsInAny(chapter.groupIds, "EDIT_CHAPTERS") ||
            (chapter.status === "SCHEDULED" && isSelf(chapter.uploaderId))
          : reviewsChapters || isOwnUnpublished(chapter),
      withdraw: (chapter) => isOwnUnpublished(chapter),
      delete: (chapter) =>
        isLive(chapter)
          ? managesChapters ||
            isInternsOwn(chapter) ||
            holdsInAny(chapter.groupIds, "DELETE_CHAPTERS")
          : reviewsChapters,
      credit: ({ chapter }) =>
        isLive(chapter)
          ? managesChapters ||
            isInternsOwn(chapter) ||
            holdsInAny(chapter.groupIds, "EDIT_CHAPTERS")
          : reviewsChapters || isOwnUnpublished(chapter),
      uncredit: ({ chapter, groupId }) =>
        isLive(chapter)
          ? managesChapters ||
            isInternsOwn(chapter) ||
            (chapter.groupIds.includes(groupId) && holds(groupId, "EDIT_CHAPTERS"))
          : reviewsChapters || isOwnUnpublished(chapter),
    },
    group: {
      create: is("UPLOADER", "ADMIN"),
      delete: is("ADMIN"),
      list: is("UPLOADER", "MODERATOR", "ADMIN"),
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
    pageReport: {
      create: active !== null,
      review: managesChapters,
    },
    ownershipRequest: {
      create: active !== null,
      review: is("ADMIN"),
    },
    groupCreationRequest: {
      create: active !== null,
      review: is("ADMIN"),
    },
    groupReport: {
      create: active !== null,
      review: is("MODERATOR", "ADMIN"),
    },
    userReport: {
      create: active !== null,
      review: is("MODERATOR", "ADMIN"),
    },
    comment: {
      create: active !== null,
      delete: is("MODERATOR", "ADMIN"),
      review: is("MODERATOR", "ADMIN"),
      removeImage: is("MODERATOR", "ADMIN"),
    },
    list: {
      moderate: moderatesLists,
      update: managesList,
      delete: managesList,
    },
    user: {
      list: is("MODERATOR", "ADMIN"),
      grant: is("ADMIN"),
      ban: moderatesUser,
      moderateProfile: moderatesUser,
      setRole: (target) => is("ADMIN") && !isSelf(target.id),
      impersonate: actsForUser,
      setPassword: actsForUser,
      manageSessions: actsForUser,
    },
    auditLog: {
      read: is("ADMIN"),
    },
  })
}
