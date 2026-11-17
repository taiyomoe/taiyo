import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { Activity, Crown, Inbox, Plus } from "@taiyomoe/ui/components/icons"
import type { OptionSet } from "@/components/fields/option-select"
import type { GroupRequestStatus, GroupRequestType } from "@/features/groups/api/groups"
import { statusDotIcon } from "@/components/fields/status-dot"
import { m } from "@/paraglide/messages"

const STATUSES = {
  PENDING: { label: m.request_status_pending, variant: "warning" },
  APPROVED: { label: m.request_status_approved, variant: "success" },
  REJECTED: { label: m.request_status_rejected, variant: "error" },
  CANCELLED: { label: m.request_status_cancelled, variant: "outline" },
} satisfies Record<GroupRequestStatus, { label: () => string; variant: BadgeVariant }>
const TYPES = {
  claims: { label: m.review_tab_claims, one: m.my_requests_claim, icon: Crown },
  creations: { label: m.review_tab_new_groups, one: m.my_requests_new_group, icon: Plus },
} satisfies Record<GroupRequestType, unknown>

export const REQUEST_STATUS_OPTIONS: OptionSet<GroupRequestStatus> = {
  values: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  label: (status) => STATUSES[status].label(),
  icon: (status) => statusDotIcon(STATUSES[status].variant),
  fieldIcon: Activity,
}

export const requestStatusVariant = (status: GroupRequestStatus) => STATUSES[status].variant

/** What one request is: a claim, or a new group. */
export const requestTypeLabel = (type: GroupRequestType) => TYPES[type].one()

export const REQUEST_TYPE_OPTIONS: OptionSet<GroupRequestType> = {
  values: ["claims", "creations"],
  label: (type) => TYPES[type].label(),
  icon: (type) => TYPES[type].icon,
  fieldIcon: Inbox,
}
