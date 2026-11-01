import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { useInvalidateReview } from "@/features/uploads/api/submissions"
import { BulkRejectDialog } from "@/features/uploads/components/chapter-reviews/bulk-reject-dialog"
import { reviewStyles } from "@/features/uploads/components/chapter-reviews/review-styles"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bulkBar: {
    gap: "0.75rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bulkSelect: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
  },
  bulkActions: {
    gap: "0.5rem",
    display: "flex",
  },
})

export function BulkReviewBar({
  selection,
  allSelected,
  onToggleAll,
  onClear,
}: {
  selection: string[]
  allSelected: boolean
  onToggleAll: (checked: boolean) => void
  onClear: () => void
}) {
  const invalidate = useInvalidateReview()
  const review = useMutation({
    mutationFn: async ({ chapterIds, reason: note }: { chapterIds: string[]; reason?: string }) => {
      if (note === undefined) {
        const response = await api.chapters.approve.$post({ json: { chapterIds } })

        return (await unwrap<Awaited<ReturnType<typeof response.json>>>(response)).skipped.length
      }

      const response = await api.chapters.reject.$post({ json: { chapterIds, reason: note } })

      return (await unwrap<Awaited<ReturnType<typeof response.json>>>(response)).skipped.length
    },
    onSuccess: invalidate,
  })
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const [skipped, setSkipped] = useState<number | null>(null)
  const run = (chapterIds: string[], rejectReason?: string) => {
    review.mutate(
      rejectReason === undefined ? { chapterIds } : { chapterIds, reason: rejectReason },
      {
        onSuccess: (count) => {
          setSkipped(count)
          setRejecting(false)
          setReason("")
          setTouched(false)
          onClear()
        },
      },
    )
  }

  return (
    <>
      <div sx={styles.bulkBar}>
        <label sx={styles.bulkSelect}>
          <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
          {selection.length === 0
            ? m.review_select_all()
            : m.review_selected({ count: selection.length })}
        </label>
        <div sx={styles.bulkActions}>
          <Button
            disabled={selection.length === 0 || review.isPending}
            onClick={() => {
              setRejecting(true)
            }}
            size="sm"
            variant="outline"
          >
            {m.review_reject_selected()}
          </Button>
          <Button
            disabled={selection.length === 0 || review.isPending}
            onClick={() => {
              run(selection)
            }}
            size="sm"
          >
            {m.review_approve_selected()}
          </Button>
        </div>
      </div>
      <ErrorAlert message={review.isError ? getErrorMessage(review.error) : null} />
      {skipped === null || skipped === 0 ? null : (
        <p sx={reviewStyles.muted}>{m.review_bulk_skipped({ count: skipped })}</p>
      )}
      <BulkRejectDialog
        onClose={() => {
          setRejecting(false)
        }}
        onReasonChange={setReason}
        onSubmit={() => {
          setTouched(true)

          if (reason.trim() !== "") {
            run(selection, reason.trim())
          }
        }}
        open={rejecting}
        pending={review.isPending}
        reason={reason}
        touched={touched}
      />
    </>
  )
}
