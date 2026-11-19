import * as stylex from "@stylexjs/stylex"
import {
  CancelCircle,
  CheckCircle,
  ExternalLink,
  FileEdit,
  User,
} from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { GroupReport } from "@/features/groups/api/groups"
import { Pill } from "@/components/badges/pill"
import { OptionValueIcon } from "@/components/fields/option-select"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import {
  GROUP_REPORT_REASON_OPTIONS,
  GROUP_REPORT_STATUS_OPTIONS,
  groupReportStatusVariant,
} from "@/features/groups/lib/group-report-labels"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  reason: {
    gap: "0.375rem",
    alignItems: "flex-start",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    minWidth: 0,
  },
  reasonIcon: {
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    height: "1lh",
  },
})

export function GroupReportRow({
  report,
  selection,
  onDetails,
  onReview,
}: {
  report: GroupReport
  selection: Selection | undefined
  onDetails: () => void
  onReview: (outcome: "RESOLVED" | "DISMISSED") => void
}) {
  const pending = report.status === "PENDING"
  const reason = (
    <span sx={styles.reason}>
      <span sx={styles.reasonIcon}>
        <OptionValueIcon options={GROUP_REPORT_REASON_OPTIONS} value={report.reason} />
      </span>
      {GROUP_REPORT_REASON_OPTIONS.label(report.reason)}
    </span>
  )
  const reporter = (
    <Uploader
      title={m.group_reports_reported_by({ name: report.reporter.displayUsername })}
      uploader={report.reporter}
    />
  )
  const review = pending ? null : (
    <>
      <Pill variant={groupReportStatusVariant(report.status)}>
        {GROUP_REPORT_STATUS_OPTIONS.label(report.status)}
      </Pill>
      {report.reviewerNote === null ? null : (
        <span sx={groupTableStyles.note} title={report.reviewerNote}>
          {report.reviewerNote}
        </span>
      )}
    </>
  )
  const actions: RowAction[] = [
    { key: "details", label: m.group_reports_view_details(), icon: FileEdit, onClick: onDetails },
    {
      key: "group",
      label: m.all_groups_view_page(),
      icon: ExternalLink,
      render: <Link params={{ groupId: report.group.id }} to="/groups/$groupId" />,
    },
    {
      key: "reporter",
      label: m.group_reports_view_reporter(),
      icon: User,
      render: <Link params={{ username: report.reporter.username }} to="/users/$username" />,
    },
    ...(pending
      ? [
          {
            key: "resolve",
            label: m.reports_resolve(),
            icon: CheckCircle,
            onClick: () => {
              onReview("RESOLVED")
            },
          },
          {
            key: "dismiss",
            label: m.reports_dismiss(),
            icon: CancelCircle,
            onClick: () => {
              onReview("DISMISSED")
            },
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell id={report.id} label={report.group.name} selection={selection} />
      )}
      <CatalogCell column="group">
        <TitleCell
          detail={
            <button
              onClick={onDetails}
              sx={[
                groupTableStyles.textButton,
                groupTableStyles.excerpt,
                report.details === null && groupTableStyles.empty,
              ]}
              title={report.details ?? undefined}
              type="button"
            >
              {report.details ?? m.group_reports_no_details()}
            </button>
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">{reason}</Folded>
                {reporter}
                <Folded until="3xl">
                  <span {...stylex.props(catalogStyles.muted)}>
                    <TimeAgo date={report.createdAt} length="long" />
                  </span>
                  {review}
                </Folded>
              </>
            ),
          }}
          thumb={
            <GroupAvatar
              id={report.group.id}
              name={report.group.name}
              sx={mediaCellStyles.avatar}
            />
          }
          title={
            <Link
              params={{ groupId: report.group.id }}
              title={report.group.name}
              to="/groups/$groupId"
              {...stylex.props(mediaCellStyles.title)}
            >
              {report.group.name}
            </Link>
          }
        />
      </CatalogCell>
      <CatalogCell column="reason">{reason}</CatalogCell>
      <CatalogCell column="reporter">{reporter}</CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <div {...stylex.props(catalogStyles.stack)}>
          <TimeAgo date={report.createdAt} length="long" />
          {review}
        </div>
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: report.group.name })} />
      </CatalogCell>
    </TableRow>
  )
}
