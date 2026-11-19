import * as stylex from "@stylexjs/stylex"
import { CalendarClock } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { isNonNull } from "remeda"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { Pill } from "@/components/badges/pill"
import { formatDateTime } from "@/components/fields/date-time-picker"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { SUBMISSION_STATUS } from "@/features/uploads/lib/submission-status"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  detail: {
    overflow: "hidden",
    display: "block",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  number: {
    marginRight: "0.375rem",
  },
  note: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  release: {
    gap: "0.375rem",
    alignItems: "flex-start",
    display: "flex",
  },
  releaseIcon: {
    flexShrink: 0,
    marginTop: "0.125rem",
  },
  reason: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontStyle: "italic",
  },
})

export const submissionLabel = (submission: ChapterSubmission) =>
  `${submission.mediaTitle ?? m.media_untitled()} — ${m.chapter_number({ number: submission.number })}`

/** The detail line of a submission: its number, its size and its title. */
export function SubmissionDetail({ submission }: { submission: ChapterSubmission }) {
  const text = [
    submission.isExternal ? m.submission_link_only() : null,
    submission.pageCount === 0 ? null : m.submission_pages({ count: submission.pageCount }),
    submission.title ??
      (submission.volume === null ? null : m.catalog_volume({ volume: submission.volume })),
  ]
    .filter(isNonNull)
    .join(" · ")

  return (
    <span sx={styles.detail} title={text}>
      <ChapterNumber number={submission.number} sx={styles.number} />
      {text}
    </span>
  )
}

export function SubmissionStatus({ submission }: { submission: ChapterSubmission }) {
  return (
    <Pill variant={SUBMISSION_STATUS[submission.status].variant}>
      {SUBMISSION_STATUS[submission.status].label()}
    </Pill>
  )
}

/** When a chapter that is not out yet goes live, if it has a release time. */
export function SubmissionRelease({ submission }: { submission: ChapterSubmission }) {
  if (
    submission.publishAt === null ||
    submission.status === "PUBLISHED" ||
    submission.status === "REJECTED"
  ) {
    return null
  }

  return (
    <span sx={[styles.note, styles.release]}>
      <CalendarClock size={14} {...stylex.props(styles.releaseIcon)} />
      {m.chapter_goes_live({ time: formatDateTime(new Date(submission.publishAt)) })}
    </span>
  )
}

/** The start of the reviewer's note on a rejected chapter; the row menu opens all of it. */
export function SubmissionRejection({ submission }: { submission: ChapterSubmission }) {
  if (submission.rejectionReason === null) {
    return null
  }

  return (
    <span sx={[styles.note, styles.reason]} title={submission.rejectionReason}>
      {submission.rejectionReason}
    </span>
  )
}
