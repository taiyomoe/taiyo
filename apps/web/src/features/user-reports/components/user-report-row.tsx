import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import {
  CancelCircle,
  CheckCircle,
  Edit,
  ExternalLink,
  FileEdit,
  User,
  UserRemove,
} from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { UserReport } from "@/features/user-reports/api/user-reports"
import type { UserReportDialog } from "@/features/user-reports/components/user-report-dialogs"
import { Pill } from "@/components/badges/pill"
import { OptionValueIcon } from "@/components/fields/option-select"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { Folded, mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import {
  GROUP_REPORT_STATUS_OPTIONS,
  groupReportStatusVariant,
} from "@/features/groups/lib/group-report-labels"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { USER_REPORT_REASON_OPTIONS } from "@/features/user-reports/lib/user-report-labels"
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

export function UserReportRow({
  report,
  can,
  selection,
  onDialog,
}: {
  report: UserReport
  can: Permissions
  selection: Selection | undefined
  onDialog: (kind: UserReportDialog["kind"]) => void
}) {
  const pending = report.status === "PENDING"
  const target = { id: report.user.id, role: report.user.role }
  const open = (kind: UserReportDialog["kind"]) => () => {
    onDialog(kind)
  }
  const reason = (
    <span sx={styles.reason}>
      <span sx={styles.reasonIcon}>
        <OptionValueIcon options={USER_REPORT_REASON_OPTIONS} value={report.reason} />
      </span>
      {USER_REPORT_REASON_OPTIONS.label(report.reason)}
    </span>
  )
  const reporter = (
    <Uploader
      title={m.group_reports_reported_by({ name: report.reporter.displayUsername })}
      uploader={report.reporter}
    />
  )
  const review = (
    <>
      {report.user.banned ? <Pill variant="error">{m.users_banned()}</Pill> : null}
      {pending ? null : (
        <Pill variant={groupReportStatusVariant(report.status)}>
          {GROUP_REPORT_STATUS_OPTIONS.label(report.status)}
        </Pill>
      )}
      {report.reviewerNote === null ? null : (
        <span sx={groupTableStyles.note} title={report.reviewerNote}>
          {report.reviewerNote}
        </span>
      )}
    </>
  )
  const actions: RowAction[] = [
    {
      key: "details",
      label: m.group_reports_view_details(),
      icon: FileEdit,
      onClick: open("details"),
    },
    {
      key: "profile",
      label: m.users_view_profile(),
      icon: ExternalLink,
      render: <Link params={{ username: report.user.username }} to="/users/$username" />,
    },
    {
      key: "reporter",
      label: m.group_reports_view_reporter(),
      icon: User,
      render: <Link params={{ username: report.reporter.username }} to="/users/$username" />,
    },
    ...(can("user.moderateProfile", target)
      ? [{ key: "editProfile", label: m.profile_edit(), icon: Edit, onClick: open("profile") }]
      : []),
    ...(pending
      ? [
          {
            key: "resolve",
            label: m.reports_resolve(),
            icon: CheckCircle,
            onClick: open("RESOLVED"),
          },
          {
            key: "dismiss",
            label: m.reports_dismiss(),
            icon: CancelCircle,
            onClick: open("DISMISSED"),
          },
        ]
      : []),
    ...(can("user.ban", target) && !report.user.banned
      ? [
          {
            key: "ban",
            label: m.users_ban(),
            icon: UserRemove,
            destructive: true,
            onClick: open("ban"),
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell
          id={report.id}
          label={report.user.displayUsername}
          selection={selection}
        />
      )}
      <CatalogCell column="user">
        <TitleCell
          detail={
            <button
              onClick={open("details")}
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
          thumb={<PersonAvatar person={report.user} sx={mediaCellStyles.avatar} />}
          title={<UserLink sx={mediaCellStyles.title} user={report.user} />}
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
        <RowActions
          actions={actions}
          label={m.catalog_actions({ name: report.user.displayUsername })}
        />
      </CatalogCell>
    </TableRow>
  )
}
