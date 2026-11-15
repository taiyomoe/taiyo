import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { COMMENT_REPORT_REASONS, type CommentReportReason } from "@taiyomoe/db/constants"
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
import { useReportComment } from "@/features/comments/api/comments"
import { COMMENT_REPORT_REASON_LABELS } from "@/features/comments/lib/report-reasons"
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

export function ReportCommentDialog({
  commentId,
  onClose,
}: {
  commentId: string | null
  onClose: () => void
}) {
  const report = useReportComment()
  const [reason, setReason] = useState<CommentReportReason>("SPAM")
  const [details, setDetails] = useState("")
  const close = () => {
    onClose()
    report.reset()
    setReason("SPAM")
    setDetails("")
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
      open={commentId !== null}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.comments_report_title()}</DialogTitle>
          <DialogDescription>{m.comments_report_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel sx={styles.panel}>
          <ErrorAlert
            message={
              report.isError
                ? getErrorMessage(report.error, { COMMENT_REPORT_EXISTS: m.comments_report_exists })
                : null
            }
          />
          <RadioGroup
            aria-label={m.comments_report_reason()}
            onValueChange={(value: CommentReportReason) => {
              setReason(value)
            }}
            sx={styles.reasons}
            value={reason}
          >
            {COMMENT_REPORT_REASONS.map((value) => (
              <label key={value} sx={styles.reason}>
                <Radio value={value} />
                {COMMENT_REPORT_REASON_LABELS[value]()}
              </label>
            ))}
          </RadioGroup>
          <Field>
            <FieldLabel>{m.comments_report_details()}</FieldLabel>
            <Textarea
              maxLength={config.comments.maxReportDetailsLength}
              onChange={(event) => {
                setDetails(event.target.value)
              }}
              placeholder={m.comments_report_details_placeholder()}
              rows={3}
              value={details}
            />
          </Field>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            loading={report.isPending}
            onClick={() => {
              if (commentId !== null) {
                report.mutate(
                  { id: commentId, reason, details },
                  {
                    onSuccess: () => {
                      toastManager.add({ title: m.comments_report_sent(), type: "success" })
                      close()
                    },
                  },
                )
              }
            }}
          >
            {m.comments_report_submit()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
