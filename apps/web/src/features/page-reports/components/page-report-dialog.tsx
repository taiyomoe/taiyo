import * as stylex from "@stylexjs/stylex"
import {
  BookOpen,
  CancelCircle,
  CheckCircle,
  Flag,
  ImageMissing,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { PageReport } from "@/features/page-reports/api/page-reports"
import { Pill } from "@/components/badges/pill"
import { formatDateTime } from "@/components/fields/date-time-picker"
import { renderWithName } from "@/components/user-name/with-name"
import { reportLabel } from "@/features/page-reports/lib/report-label"
import {
  REPORT_REASON_LABELS,
  REPORT_REASON_OPTIONS,
  REPORT_STATUS,
} from "@/features/page-reports/lib/report-reasons"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    maxWidth: "48rem",
  },
  body: {
    gap: "1.25rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "minmax(0, 15rem) minmax(0, 1fr)",
    },
  },
  imageLink: {
    borderRadius: radius.lg,
    overflow: "hidden",
    alignSelf: "start",
    backgroundColor: colors.muted,
    cursor: "zoom-in",
    display: "block",
  },
  missing: {
    padding: "1rem",
    borderRadius: radius.lg,
    gap: "0.5rem",
    alignItems: "center",
    alignSelf: "start",
    aspectRatio: "2 / 3",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    fontSize: "0.8125rem",
    justifyContent: "center",
    textAlign: "center",
    maxHeight: "16rem",
  },
  image: {
    display: "block",
    objectFit: "contain",
    maxHeight: { default: "40vh", [breakpoints.md]: "26rem" },
    width: "100%",
  },
  facts: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  pills: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  heading: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    marginBottom: "0.375rem",
  },
  text: {
    margin: 0,
    fontSize: "0.875rem",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  muted: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
})

function PagePreview({ report }: { report: PageReport }) {
  const [failed, setFailed] = useState(false)

  if (report.page === null || failed) {
    return (
      <div sx={styles.missing}>
        <ImageMissing size={20} />
        {failed ? m.page_reports_image_failed() : m.page_reports_page_missing()}
      </div>
    )
  }

  return (
    <a href={report.pageUrl} rel="noreferrer" sx={styles.imageLink} target="_blank">
      <img
        alt={reportLabel(report)}
        onError={() => {
          setFailed(true)
        }}
        src={report.pageUrl}
        sx={styles.image}
      />
    </a>
  )
}

/** Everything a report says, with the page at a readable size. */
export function PageReportDialog({
  report,
  pending,
  onClose,
  onCloseReport,
}: {
  report: PageReport | null
  pending: boolean
  onClose: () => void
  onCloseReport: (status: "RESOLVED" | "DISMISSED") => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={report !== null}
    >
      <DialogPopup sx={styles.popup}>
        {report === null ? null : (
          <>
            <DialogHeader>
              <DialogTitle>{reportLabel(report)}</DialogTitle>
              <DialogDescription>
                {renderWithName(
                  (inputs) =>
                    m.page_reports_reported_by_on({
                      ...inputs,
                      date: formatDateTime(new Date(report.createdAt)),
                    }),
                  report.reporter,
                  { link: true },
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div sx={styles.body}>
                <PagePreview report={report} />
                <div sx={styles.facts}>
                  <div sx={styles.pills}>
                    <Pill icon={REPORT_REASON_OPTIONS.icon(report.reason)}>
                      {REPORT_REASON_OPTIONS.label(report.reason)}
                    </Pill>
                    <Pill variant={REPORT_STATUS[report.status].variant}>
                      {REPORT_STATUS[report.status].label()}
                    </Pill>
                    {report.samePageReports > 1 ? (
                      <Pill icon={Flag} variant="secondary">
                        {m.page_reports_same_page({ count: report.samePageReports })}
                      </Pill>
                    ) : null}
                  </div>
                  <section>
                    <h3 sx={styles.heading}>{m.reader_report_reason()}</h3>
                    <p sx={styles.text}>{REPORT_REASON_LABELS[report.reason]()}</p>
                  </section>
                  <section>
                    <h3 sx={styles.heading}>{m.page_reports_details()}</h3>
                    <p sx={[styles.text, report.comment === null && styles.muted]}>
                      {report.comment ?? m.page_reports_no_details()}
                    </p>
                  </section>
                  {report.resolvedAt === null ? null : (
                    <section>
                      <h3 sx={styles.heading}>{REPORT_STATUS[report.status].label()}</h3>
                      <p sx={styles.text}>{formatDateTime(new Date(report.resolvedAt))}</p>
                    </section>
                  )}
                </div>
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button
                render={
                  <Link
                    params={{ chapterId: report.chapter.id }}
                    search={{ page: report.page ?? undefined }}
                    to="/chapters/$chapterId"
                  />
                }
                variant="outline"
              >
                <BookOpen />
                {m.page_reports_open_reader()}
              </Button>
              {report.status === "OPEN" ? (
                <>
                  <Button
                    disabled={pending}
                    onClick={() => {
                      onCloseReport("DISMISSED")
                    }}
                    variant="outline"
                  >
                    <CancelCircle />
                    {m.page_reports_dismiss()}
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => {
                      onCloseReport("RESOLVED")
                    }}
                  >
                    <CheckCircle />
                    {m.page_reports_mark_resolved()}
                  </Button>
                </>
              ) : null}
            </DialogFooter>
          </>
        )}
      </DialogPopup>
    </Dialog>
  )
}
