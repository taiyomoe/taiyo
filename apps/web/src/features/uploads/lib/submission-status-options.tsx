import { CHAPTER_STATUSES, type ChapterStatus } from "@taiyomoe/db/constants"
import { Activity } from "@taiyomoe/ui/components/icons"
import type { OptionIcon, OptionSet } from "@/components/fields/option-select"
import { statusDotIcon } from "@/components/fields/status-dot"
import { SUBMISSION_STATUS } from "@/features/uploads/lib/submission-status"

const STATUS_ICONS: Record<ChapterStatus, OptionIcon> = {
  UPLOADING: statusDotIcon(SUBMISSION_STATUS.UPLOADING.variant),
  PENDING: statusDotIcon(SUBMISSION_STATUS.PENDING.variant),
  SCHEDULED: statusDotIcon(SUBMISSION_STATUS.SCHEDULED.variant),
  PUBLISHED: statusDotIcon(SUBMISSION_STATUS.PUBLISHED.variant),
  REJECTED: statusDotIcon(SUBMISSION_STATUS.REJECTED.variant),
}

export const CHAPTER_STATUS_OPTIONS: OptionSet<ChapterStatus> = {
  values: CHAPTER_STATUSES,
  label: (status) => SUBMISSION_STATUS[status].label(),
  icon: (status) => STATUS_ICONS[status],
  fieldIcon: Activity,
}
