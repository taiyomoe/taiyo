import * as stylex from "@stylexjs/stylex"
import {
  BookOpen,
  CancelCircle,
  CheckCircle,
  ExternalLink,
  Flag,
  Info,
} from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { isNonNull } from "remeda"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { PageReport } from "@/features/page-reports/api/page-reports"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { Uploader } from "@/features/chapters/components/uploader"
import { PageThumb } from "@/features/page-reports/components/page-thumb"
import { reportLabel } from "@/features/page-reports/lib/report-label"
import { REPORT_REASON_OPTIONS, REPORT_STATUS } from "@/features/page-reports/lib/report-reasons"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  place: {
    overflow: "hidden",
    textDecoration: { default: "none", ":hover": "underline" },
    color: "inherit",
    display: "block",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  number: {
    marginRight: "0.375rem",
  },
  comment: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
})

export function PageReportRow({
  report,
  selection,
  showStatus,
  pending,
  onDetails,
  onCloseReport,
}: {
  report: PageReport
  selection: Selection | undefined
  showStatus: boolean
  pending: boolean
  onDetails: () => void
  onCloseReport: (status: "RESOLVED" | "DISMISSED") => void
}) {
  const label = reportLabel(report)
  const open = report.status === "OPEN"
  const reader = (
    <Link
      params={{ chapterId: report.chapter.id }}
      search={{ page: report.page ?? undefined }}
      to="/chapters/$chapterId"
    />
  )
  const actions: RowAction[] = [
    { key: "details", label: m.page_reports_view_details(), icon: Info, onClick: onDetails },
    { key: "reader", label: m.page_reports_open_reader(), icon: BookOpen, render: reader },
    {
      key: "media",
      label: m.catalog_view_page(),
      icon: ExternalLink,
      render: <Link params={{ mediaId: report.chapter.mediaId }} to="/media/$mediaId" />,
    },
    ...(open
      ? [
          {
            key: "resolve",
            label: m.page_reports_mark_resolved(),
            icon: CheckCircle,
            disabled: pending,
            onClick: () => {
              onCloseReport("RESOLVED")
            },
          },
          {
            key: "dismiss",
            label: m.page_reports_dismiss(),
            icon: CancelCircle,
            disabled: pending,
            onClick: () => {
              onCloseReport("DISMISSED")
            },
          },
        ]
      : []),
  ]
  const reason = (
    <Pill icon={REPORT_REASON_OPTIONS.icon(report.reason)}>
      {REPORT_REASON_OPTIONS.label(report.reason)}
    </Pill>
  )
  const samePage =
    report.samePageReports > 1 ? (
      <Pill icon={Flag} variant="secondary">
        {m.page_reports_same_page({ count: report.samePageReports })}
      </Pill>
    ) : null
  const status = (
    <Pill variant={REPORT_STATUS[report.status].variant}>
      {REPORT_STATUS[report.status].label()}
    </Pill>
  )
  const comment =
    report.comment === null ? null : (
      <span sx={styles.comment} title={report.comment}>
        {report.comment}
      </span>
    )
  const reporter = (
    <Uploader
      title={m.page_reports_reported_by({ user: report.reporter.displayUsername })}
      uploader={report.reporter}
    />
  )
  const place = [
    report.page === null
      ? m.page_reports_page_removed()
      : m.page_reports_page({ page: report.page }),
    report.chapter.title,
  ]
    .filter(isNonNull)
    .join(" · ")

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell id={report.id} label={label} selection={selection} />
      )}
      <CatalogCell column="page">
        <TitleCell
          detail={
            <Link
              params={{ chapterId: report.chapter.id }}
              search={{ page: report.page ?? undefined }}
              title={place}
              to="/chapters/$chapterId"
              {...stylex.props(styles.place)}
            >
              <ChapterNumber number={report.chapter.number} sx={styles.number} />
              {place}
            </Link>
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  {reason}
                  {samePage}
                </Folded>
                {showStatus ? status : null}
                {reporter}
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={report.createdAt} length="long" />
                </span>
                <Folded until="3xl">{comment}</Folded>
              </>
            ),
          }}
          thumb={<PageThumb label={label} report={report} />}
          title={
            <Link
              params={{ mediaId: report.chapter.mediaId }}
              title={report.chapter.mediaTitle ?? m.media_untitled()}
              to="/media/$mediaId"
              {...stylex.props(mediaCellStyles.title)}
            >
              {report.chapter.mediaTitle ?? m.media_untitled()}
            </Link>
          }
        />
      </CatalogCell>
      <CatalogCell column="report">
        <div {...stylex.props(catalogStyles.stack)}>
          <div {...stylex.props(catalogStyles.inline)}>
            {reason}
            {samePage}
          </div>
          {comment}
        </div>
      </CatalogCell>
      <CatalogCell column="reporter">{reporter}</CatalogCell>
      {showStatus ? (
        <CatalogCell column="status">
          <div {...stylex.props(catalogStyles.stack)}>
            {status}
            {report.resolvedAt === null ? null : (
              <span {...stylex.props(catalogStyles.muted)}>
                <TimeAgo date={report.resolvedAt} length="long" />
              </span>
            )}
          </div>
        </CatalogCell>
      ) : null}
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={report.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: label })} />
      </CatalogCell>
    </TableRow>
  )
}
