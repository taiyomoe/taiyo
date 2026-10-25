import type {
  ChapterStatus,
  GroupMembershipRole,
  GroupPermission,
  MediaSuggestionStatus,
  Role,
} from "@taiyomoe/db/constants"
import type { ValidateDefinition } from "permix"

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

export type GroupTarget = { id: string }

export type ChapterTarget = {
  uploaderId: string
  status: ChapterStatus
  groupIds: readonly string[]
}

export type ChapterCreditTarget = { chapter: ChapterTarget; groupId: string }

export type MemberTarget = {
  groupId: string
  userId: string
  role: GroupMembershipRole
  permissions: readonly GroupPermission[]
}

export type GrantTarget = { groupId: string; permissions: readonly GroupPermission[] }

export type MemberPermissionsTarget = {
  member: MemberTarget
  permissions: readonly GroupPermission[]
}

export type MediaSuggestionTarget = { authorId: string; status: MediaSuggestionStatus }

export type UserTarget = { id: string; role: Role }

export type PermissionsDefinition = ValidateDefinition<{
  dashboard: ["open", "viewStats"]
  media: ["create", "update", "suggest", "delete", "restore", "flag", "reindex"]
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
  ownershipRequest: ["create", "review"]
  groupCreationRequest: ["create", "review"]
  comment: ["delete"]
  user: [
    "list",
    { name: "ban"; type: UserTarget; required: true },
    { name: "setRole"; type: UserTarget; required: true },
  ]
}>
