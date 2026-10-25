import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Badge, type BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { ChapterSubmission } from "@/lib/queries/submissions"
import { ChapterGroups, ChapterNumber, TimeAgo, Uploader } from "@/components/chapters/chapter-meta"
import { LanguageChip } from "@/components/chapters/flags"
import { ListRow } from "@/components/dashboard/dashboard-page"
import { Cover } from "@/components/media/cover"
import { m } from "@/paraglide/messages"

const SUBMISSION_STATUS: Record<
  ChapterSubmission["status"],
  { label: () => string; variant: BadgeVariant }
> = {
  UPLOADING: { label: m.submission_status_uploading, variant: "info" },
  PENDING: { label: m.submission_status_pending, variant: "warning" },
  PUBLISHED: { label: m.submission_status_published, variant: "success" },
  REJECTED: { label: m.submission_status_rejected, variant: "error" },
}
const styles = stylex.create({
  cover: {
    flexShrink: 0,
    width: "3rem",
  },
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  media: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  chapterTitle: {
    color: colors.mutedForeground,
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  reason: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
    overflowWrap: "anywhere",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexShrink: 0,
  },
})

export function SubmissionRow({
  submission,
  showUploader = false,
  leading,
  actions,
}: {
  submission: ChapterSubmission
  showUploader?: boolean
  leading?: ReactNode
  actions?: ReactNode
}) {
  return (
    <ListRow>
      {leading}
      <Cover src={submission.mediaCoverUrl} sx={styles.cover} />
      <div sx={styles.main}>
        <div sx={styles.titleLine}>
          <Link
            params={{ mediaId: submission.mediaId }}
            to="/media/$mediaId"
            {...stylex.props(styles.media)}
          >
            {submission.mediaTitle ?? m.media_untitled()}
          </Link>
          <ChapterNumber number={submission.number} />
          {submission.title === null ? null : (
            <span sx={styles.chapterTitle}>{submission.title}</span>
          )}
          <Badge variant={SUBMISSION_STATUS[submission.status].variant}>
            {SUBMISSION_STATUS[submission.status].label()}
          </Badge>
        </div>
        <div sx={styles.meta}>
          <LanguageChip language={submission.language} />
          <ChapterGroups groups={submission.groups} max={2} />
          {showUploader ? <Uploader uploader={submission.uploader} /> : null}
          <span>{m.submission_pages({ count: submission.pageCount })}</span>
          <TimeAgo date={submission.createdAt} />
        </div>
        {submission.rejectionReason === null ? null : (
          <p sx={styles.reason}>{m.submission_reason({ reason: submission.rejectionReason })}</p>
        )}
      </div>
      {actions === undefined ? null : <div sx={styles.actions}>{actions}</div>}
    </ListRow>
  )
}
