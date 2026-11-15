import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import type { MediaSuggestion } from "@/features/media-suggestions/api/media-suggestions"
import { m } from "@/paraglide/messages"

export const SUGGESTION_STATUS: Record<
  MediaSuggestion["status"],
  { label: () => string; variant: BadgeVariant }
> = {
  PENDING: { label: m.submission_status_pending, variant: "warning" },
  ACCEPTED: { label: m.suggestion_status_accepted, variant: "success" },
  REJECTED: { label: m.submission_status_rejected, variant: "error" },
  WITHDRAWN: { label: m.suggestion_status_withdrawn, variant: "secondary" },
}
