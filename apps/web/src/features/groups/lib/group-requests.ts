import type {
  GroupCreationRequest,
  GroupRequestStatus,
  GroupRequestType,
  MyGroupCreationRequest,
  MyOwnershipRequest,
  OwnershipRequest,
} from "@/features/groups/api/groups"

/** A claim on a group or a request for a new one, as the request tables show both. */
export type GroupRequestItem = {
  id: string
  type: GroupRequestType
  status: GroupRequestStatus
  /** The claimed group's name, or the name asked for. */
  name: string
  /** The claimed group, or the group created on approval. */
  groupId: string | null
  message: string | null
  description: string | null
  proofLinks: readonly string[]
  reviewerNote: string | null
  createdAt: string
  /** Who filed it; absent from the user's own requests. */
  requester: OwnershipRequest["requester"] | null
  /** Why it cannot be approved right now: the group has an owner, or the name is taken. */
  blocker: "OWNED" | "NAME_TAKEN" | null
}

export const fromClaim = (claim: OwnershipRequest | MyOwnershipRequest) =>
  ({
    id: claim.id,
    type: "claims",
    status: claim.status,
    name: claim.group.name,
    groupId: claim.group.id,
    message: claim.message,
    description: null,
    proofLinks: claim.proofLinks,
    reviewerNote: claim.reviewerNote,
    createdAt: claim.createdAt,
    requester: "requester" in claim ? claim.requester : null,
    blocker: "owned" in claim.group && claim.group.owned ? "OWNED" : null,
  }) satisfies GroupRequestItem

export const fromCreation = (creation: GroupCreationRequest | MyGroupCreationRequest) =>
  ({
    id: creation.id,
    type: "creations",
    status: creation.status,
    name: creation.name,
    groupId: creation.groupId,
    message: creation.message,
    description: creation.description,
    proofLinks: creation.proofLinks,
    reviewerNote: creation.reviewerNote,
    createdAt: creation.createdAt,
    requester: "requester" in creation ? creation.requester : null,
    blocker: "nameTaken" in creation && creation.nameTaken ? "NAME_TAKEN" : null,
  }) satisfies GroupRequestItem
