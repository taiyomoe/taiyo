import { Button } from "@taiyomoe/ui/components/ui/button"
import type { GroupReport } from "@/features/groups/api/groups"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { renderWithName } from "@/components/user-name/with-name"
import {
  DetailDialog,
  DetailQuote,
  DetailSection,
} from "@/features/groups/components/detail-dialog"
import { ReviewNoteDialog } from "@/features/groups/components/review-note-dialog"
import {
  GROUP_REPORT_REASON_OPTIONS,
  GROUP_REPORT_STATUS_OPTIONS,
  groupReportStatusVariant,
} from "@/features/groups/lib/group-report-labels"
import { m } from "@/paraglide/messages"

export type GroupReportOutcome = "RESOLVED" | "DISMISSED"

export type GroupReportDialog =
  | { kind: "details"; reports: GroupReport[]; bulk: false }
  | { kind: GroupReportOutcome; reports: GroupReport[]; bulk: boolean }

const OUTCOMES = {
  RESOLVED: {
    title: m.group_reports_resolve_title,
    bulkTitle: m.group_reports_bulk_resolve_title,
    description: m.group_reports_resolve_description,
    confirm: m.reports_resolve,
  },
  DISMISSED: {
    title: m.group_reports_dismiss_title,
    bulkTitle: m.group_reports_bulk_dismiss_title,
    description: m.group_reports_dismiss_description,
    confirm: m.reports_dismiss,
  },
}

/** The dialogs the report table opens, one at a time, for one row or for the selection. */
export function GroupReportDialogs({
  dialog,
  pending,
  error,
  onReview,
  onOpenReview,
  onClose,
}: {
  dialog: GroupReportDialog | null
  pending: boolean
  error: string | null
  onReview: (outcome: GroupReportOutcome, reports: GroupReport[], note: string) => void
  onOpenReview: (outcome: GroupReportOutcome, report: GroupReport) => void
  onClose: () => void
}) {
  const [report] = dialog?.reports ?? []
  const outcome = dialog === null || dialog.kind === "details" ? null : dialog.kind
  const shown = dialog?.kind === "details" ? report : undefined

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
        title={shown === undefined ? null : shown.group.name}
      >
        {shown === undefined ? null : (
          <>
            <DetailSection title={m.group_report_reason()}>
              <div>
                <Pill icon={GROUP_REPORT_REASON_OPTIONS.icon(shown.reason)} variant="error">
                  {GROUP_REPORT_REASON_OPTIONS.label(shown.reason)}
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
                    ? OUTCOMES[outcome].title({ name: report.group.name })
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
    </>
  )
}
