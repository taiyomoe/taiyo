import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { PageReport } from "@/features/page-reports/api/page-reports"
import { ListRow } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { REPORT_REASON_LABELS } from "@/features/page-reports/lib/report-reasons"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  thumb: {
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    flexShrink: 0,
    objectFit: "cover",
    objectPosition: "top",
    height: "5.5rem",
    width: "4rem",
  },
  body: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 72%, transparent)`,
    },
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  reason: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  comment: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    overflowWrap: "anywhere",
  },
  meta: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexShrink: 0,
  },
})

export function PageReportRow({
  report,
  pending,
  onClose,
}: {
  report: PageReport
  pending: boolean
  onClose: ((status: "RESOLVED" | "DISMISSED") => void) | null
}) {
  const label = [
    report.chapter.mediaTitle ?? m.media_untitled(),
    m.chapter_number({ number: report.chapter.number }),
    report.page === null
      ? m.page_reports_page_removed()
      : m.page_reports_page({ page: report.page }),
  ].join(" · ")

  return (
    <ListRow>
      <img alt="" decoding="async" loading="lazy" src={report.pageUrl} sx={styles.thumb} />
      <div sx={styles.body}>
        <Link
          params={{ chapterId: report.chapter.id }}
          search={{ page: report.page ?? undefined }}
          to="/chapters/$chapterId"
          {...stylex.props(styles.title)}
        >
          {label}
        </Link>
        <span sx={styles.reason}>
          {REPORT_REASON_LABELS[report.reason]()}
          {report.samePageReports > 1 ? (
            <Badge variant="secondary">
              {m.page_reports_same_page({ count: report.samePageReports })}
            </Badge>
          ) : null}
        </span>
        {report.comment === null ? null : <p sx={styles.comment}>{report.comment}</p>}
        <span sx={styles.meta}>
          {m.page_reports_reported_by({ user: report.reporter.displayUsername })} ·{" "}
          <TimeAgo date={report.createdAt} />
        </span>
      </div>
      {onClose === null ? null : (
        <div sx={styles.actions}>
          <Button
            disabled={pending}
            onClick={() => {
              onClose("DISMISSED")
            }}
            size="sm"
            variant="ghost"
          >
            {m.page_reports_dismiss()}
          </Button>
          <Button
            disabled={pending}
            onClick={() => {
              onClose("RESOLVED")
            }}
            size="sm"
          >
            {m.page_reports_resolve()}
          </Button>
        </div>
      )}
    </ListRow>
  )
}
