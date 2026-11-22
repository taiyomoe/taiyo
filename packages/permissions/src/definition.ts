import type {
  ChapterStatus,
  GroupMembershipRole,
  GroupPermission,
  MediaSuggestionStatus,
  Role,
  UserListVisibility,
} from "@taiyomoe/db/constants"
import type { ValidateDefinition } from "permix"

/** @internal Exported for its tests. */
export type ActorMembership = {
  groupId: string
  role: GroupMembershipRole
  permissions: readonly GroupPermission[]
}

export type Actor = {
  id: string
  role: Role
  banned: boolean
  memberships: readonly ActorMembership[]
}

type GroupTarget = { id: string }

export type ChapterTarget = {
  uploaderId: string
  status: ChapterStatus
  groupIds: readonly string[]
}

type ChapterCreditTarget = { chapter: ChapterTarget; groupId: string }

export type MemberTarget = {
  groupId: string
  userId: string
  role: GroupMembershipRole
  permissions: readonly GroupPermission[]
}

type GrantTarget = { groupId: string; permissions: readonly GroupPermission[] }

type MemberPermissionsTarget = {
  member: MemberTarget
  permissions: readonly GroupPermission[]
}

export type MediaSuggestionTarget = { authorId: string; status: MediaSuggestionStatus }

export type UserTarget = { id: string; role: Role }

export type ListTarget = { userId: string; visibility: UserListVisibility }

export type PermissionsDefinition = ValidateDefinition<{
  dashboard: ["open", "viewStats"]
  media: [
    "create",
    "update",
    "suggest",
    "delete",
    "restore",
    "merge",
    "flag",
    "reindex",
    "syncMangaDex",
    "feature",
  ]
  mediaSuggestion: [
    "review",
    { name: "view"; type: MediaSuggestionTarget; required: true },
    { name: "update"; type: MediaSuggestionTarget; required: true },
    { name: "withdraw"; type: MediaSuggestionTarget; required: true },
  ]
  staff: ["create", "update", "delete"]
  chapter: [
    "publish",
    "submit",
    "review",
    "flag",
    "list",
    "listInGroups",
    { name: "view"; type: ChapterTarget; required: true },
    { name: "update"; type: ChapterTarget; required: true },
    { name: "withdraw"; type: ChapterTarget; required: true },
    { name: "delete"; type: ChapterTarget; required: true },
    { name: "credit"; type: ChapterCreditTarget; required: true },
    { name: "uncredit"; type: ChapterCreditTarget; required: true },
  ]
  group: [
    "create",
    "delete",
    "list",
    { name: "update"; type: GroupTarget; required: true },
    { name: "uploadChapters"; type: GroupTarget; required: true },
    { name: "manageMembers"; type: GroupTarget; required: true },
    { name: "transferOwnership"; type: GroupTarget; required: true },
    { name: "inviteMember"; type: GrantTarget; required: true },
    { name: "updateMember"; type: MemberPermissionsTarget; required: true },
    { name: "removeMember"; type: MemberTarget; required: true },
    { name: "promoteMember"; type: MemberTarget; required: true },
    { name: "demoteMember"; type: MemberTarget; required: true },
  ]
  pageReport: ["create", "review"]
  ownershipRequest: ["create", "review"]
  groupCreationRequest: ["create", "review"]
  groupReport: ["create", "review"]
  userReport: ["create", "review"]
  comment: ["create", "delete", "review", "removeImage"]
  mediaReview: ["delete", "review"]
  list: [
    "moderate",
    { name: "update"; type: ListTarget; required: true },
    { name: "delete"; type: ListTarget; required: true },
  ]
  user: [
    "list",
    "grant",
    { name: "ban"; type: UserTarget; required: true },
    { name: "moderateProfile"; type: UserTarget; required: true },
    { name: "setRole"; type: { id: string }; required: true },
    { name: "impersonate"; type: UserTarget; required: true },
    { name: "setPassword"; type: UserTarget; required: true },
    { name: "manageSessions"; type: UserTarget; required: true },
  ]
  auditLog: ["read"]
}>
