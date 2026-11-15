import * as stylex from "@stylexjs/stylex"
import { PAGE_REPORT_REASONS, type PageReportReason } from "@taiyomoe/db/constants"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Radio, RadioGroup } from "@taiyomoe/ui/components/ui/radio-group"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { REPORT_REASON_LABELS } from "@/features/page-reports/lib/report-reasons"
import { useReportPage } from "@/features/reader/api/page-actions"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  panel: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  reasons: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  reason: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
  },
})

export function ReportPageDialog({
  target,
  onClose,
}: {
  target: { chapterId: string; pageId: string; page: number; chapterLabel: string } | null
  onClose: () => void
}) {
  const report = useReportPage()
  const [reason, setReason] = useState<PageReportReason>("BROKEN")
  const [comment, setComment] = useState("")
  const close = () => {
    onClose()
    report.reset()
    setReason("BROKEN")
    setComment("")
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
      open={target !== null}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.reader_report_title()}</DialogTitle>
          <DialogDescription>
            {target === null
              ? null
              : m.reader_report_description({ chapter: target.chapterLabel, page: target.page })}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel sx={styles.panel}>
          <ErrorAlert
            message={
              report.isError
                ? getErrorMessage(report.error, { PAGE_REPORT_EXISTS: m.reader_report_exists })
                : null
            }
          />
          <RadioGroup
            aria-label={m.reader_report_reason()}
            onValueChange={(value: PageReportReason) => {
              setReason(value)
            }}
            sx={styles.reasons}
            value={reason}
          >
            {PAGE_REPORT_REASONS.map((value) => (
              <label key={value} sx={styles.reason}>
                <Radio value={value} />
                {REPORT_REASON_LABELS[value]()}
              </label>
            ))}
          </RadioGroup>
          <Field>
            <FieldLabel>{m.reader_report_comment()}</FieldLabel>
            <Textarea
              maxLength={500}
              onChange={(event) => {
                setComment(event.target.value)
              }}
              placeholder={m.reader_report_comment_placeholder()}
              rows={3}
              value={comment}
            />
          </Field>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={report.isPending || target === null}
            onClick={() => {
              if (target !== null) {
                report.mutate(
                  { chapterId: target.chapterId, pageId: target.pageId, reason, comment },
                  {
                    onSuccess: () => {
                      toastManager.add({ title: m.reader_report_sent(), type: "success" })
                      close()
                    },
                  },
                )
              }
            }}
          >
            {m.reader_report_submit()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
