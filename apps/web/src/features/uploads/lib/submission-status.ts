import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { m } from "@/paraglide/messages"

export const SUBMISSION_STATUS: Record<
  ChapterSubmission["status"],
  { label: () => string; variant: BadgeVariant }
> = {
  UPLOADING: { label: m.submission_status_uploading, variant: "info" },
  PENDING: { label: m.submission_status_pending, variant: "warning" },
  SCHEDULED: { label: m.submission_status_scheduled, variant: "info" },
  PUBLISHED: { label: m.submission_status_published, variant: "success" },
  REJECTED: { label: m.submission_status_rejected, variant: "error" },
}
