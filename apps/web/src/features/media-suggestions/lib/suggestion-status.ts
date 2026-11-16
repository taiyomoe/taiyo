import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { MEDIA_SUGGESTION_STATUSES, type MediaSuggestionStatus } from "@taiyomoe/db/constants"
import { Activity } from "@taiyomoe/ui/components/icons"
import type { OptionIcon, OptionSet } from "@/components/fields/option-select"
import { statusDotIcon } from "@/components/fields/status-dot"
import { m } from "@/paraglide/messages"

export const SUGGESTION_STATUS: Record<
  MediaSuggestionStatus,
  { label: () => string; variant: BadgeVariant }
> = {
  PENDING: { label: m.submission_status_pending, variant: "warning" },
  ACCEPTED: { label: m.suggestion_status_accepted, variant: "success" },
  REJECTED: { label: m.suggestion_status_rejected, variant: "error" },
  WITHDRAWN: { label: m.suggestion_status_withdrawn, variant: "secondary" },
}

const STATUS_ICONS: Record<MediaSuggestionStatus, OptionIcon> = {
  PENDING: statusDotIcon(SUGGESTION_STATUS.PENDING.variant),
  ACCEPTED: statusDotIcon(SUGGESTION_STATUS.ACCEPTED.variant),
  REJECTED: statusDotIcon(SUGGESTION_STATUS.REJECTED.variant),
  WITHDRAWN: statusDotIcon(SUGGESTION_STATUS.WITHDRAWN.variant),
}

export const SUGGESTION_STATUS_OPTIONS: OptionSet<MediaSuggestionStatus> = {
  values: MEDIA_SUGGESTION_STATUSES,
  label: (status) => SUGGESTION_STATUS[status].label(),
  icon: (status) => STATUS_ICONS[status],
  fieldIcon: Activity,
}
