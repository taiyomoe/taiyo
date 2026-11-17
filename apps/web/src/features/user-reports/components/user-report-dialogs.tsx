import { Button } from "@taiyomoe/ui/components/ui/button"
import type { UserReport } from "@/features/user-reports/api/user-reports"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { UserName } from "@/components/user-name/user-name"
import { renderWithName } from "@/components/user-name/with-name"
import {
  DetailDialog,
  DetailQuote,
  DetailSection,
} from "@/features/groups/components/detail-dialog"
import { ReviewNoteDialog } from "@/features/groups/components/review-note-dialog"
import {
  GROUP_REPORT_STATUS_OPTIONS,
  groupReportStatusVariant,
} from "@/features/groups/lib/group-report-labels"
import { USER_REPORT_REASON_OPTIONS } from "@/features/user-reports/lib/user-report-labels"
import { BanDialog } from "@/features/users/components/users/ban-dialog"
import { ModerateProfileDialog } from "@/features/users/components/users/moderate-profile-dialog"
import { m } from "@/paraglide/messages"

export type UserReportOutcome = "RESOLVED" | "DISMISSED"

export type UserReportDialog =
  | { kind: "details" | "profile" | "ban"; reports: UserReport[]; bulk: false }
  | { kind: UserReportOutcome; reports: UserReport[]; bulk: boolean }

const OUTCOMES = {
  RESOLVED: {
    title: m.group_reports_resolve_title,
    bulkTitle: m.group_reports_bulk_resolve_title,
    description: m.user_reports_resolve_description,
    confirm: m.reports_resolve,
  },
  DISMISSED: {
    title: m.group_reports_dismiss_title,
    bulkTitle: m.group_reports_bulk_dismiss_title,
    description: m.user_reports_dismiss_description,
    confirm: m.reports_dismiss,
  },
}

/** The dialogs the profile report table opens, one at a time, for one row or for the selection. */
export function UserReportDialogs({
  dialog,
  pending,
  error,
  onReview,
  onOpenReview,
  onClose,
}: {
  dialog: UserReportDialog | null
  pending: boolean
  error: string | null
  onReview: (outcome: UserReportOutcome, reports: UserReport[], note: string) => void
  onOpenReview: (outcome: UserReportOutcome, report: UserReport) => void
  onClose: () => void
}) {
  const [report] = dialog?.reports ?? []
  const outcome = dialog?.kind === "RESOLVED" || dialog?.kind === "DISMISSED" ? dialog.kind : null
  const shown = dialog?.kind === "details" ? report : undefined
  const target = (kind: UserReportDialog["kind"]) =>
    dialog?.kind === kind && report !== undefined ? report.user : null

  return (
    <>
      <DetailDialog
        footer={
          shown?.status === "PENDING" ? (
            <>
              <Button
                onClick={() => {
                  onOpenReview("DISMISSED", shown)
                }}
                variant="outline"
              >
                {m.reports_dismiss()}
              </Button>
              <Button
                onClick={() => {
                  onOpenReview("RESOLVED", shown)
                }}
              >
                {m.reports_resolve()}
              </Button>
            </>
          ) : null
        }
        meta={
          shown === undefined ? null : (
            <>
              {renderWithName(m.group_reports_reported_by, shown.reporter)}
              <span aria-hidden>·</span>
              <TimeAgo date={shown.createdAt} length="long" />
            </>
          )
        }
        onClose={onClose}
        open={shown !== undefined}
        title={
          shown === undefined ? null : (
            <UserName effect={shown.user.nameEffect} name={shown.user.displayUsername} />
          )
        }
      >
        {shown === undefined ? null : (
          <>
            <DetailSection title={m.group_report_reason()}>
              <div>
                <Pill icon={USER_REPORT_REASON_OPTIONS.icon(shown.reason)} variant="error">
                  {USER_REPORT_REASON_OPTIONS.label(shown.reason)}
                </Pill>
              </div>
            </DetailSection>
            <DetailSection title={m.group_reports_details()}>
              <DetailQuote>{shown.details ?? m.group_reports_no_details()}</DetailQuote>
            </DetailSection>
            {shown.status === "PENDING" ? null : (
              <DetailSection title={m.group_reports_review()}>
                <div>
                  <Pill variant={groupReportStatusVariant(shown.status)}>
                    {GROUP_REPORT_STATUS_OPTIONS.label(shown.status)}
                  </Pill>
                </div>
                {shown.reviewerNote === null ? null : (
                  <DetailQuote>{shown.reviewerNote}</DetailQuote>
                )}
              </DetailSection>
            )}
          </>
        )}
      </DetailDialog>
      <ReviewNoteDialog
        error={error}
        onClose={onClose}
        onConfirm={(note) => {
          if (outcome !== null && dialog !== null) {
            onReview(outcome, dialog.reports, note)
          }
        }}
        pending={pending}
        request={
          outcome === null || report === undefined || dialog === null
            ? null
            : {
                title:
                  dialog.reports.length === 1
                    ? renderWithName(OUTCOMES[outcome].title, report.user)
                    : OUTCOMES[outcome].bulkTitle({ count: dialog.reports.length }),
                description: OUTCOMES[outcome].description(),
                label: m.group_reports_note(),
                hint: m.group_reports_note_hint(),
                placeholder: m.group_reports_note_placeholder(),
                required: false,
                confirmLabel: OUTCOMES[outcome].confirm(),
                destructive: false,
              }
        }
      />
      <ModerateProfileDialog onClose={onClose} user={target("profile")} />
      <BanDialog onClose={onClose} user={target("ban")} />
    </>
  )
}
