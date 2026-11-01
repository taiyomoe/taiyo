import type { Language } from "@taiyomoe/db/constants"
import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import {
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import type { GroupOption } from "@/features/groups/components/group-picker"
import { ErrorAlert } from "@/components/feedback/error-alert"
import {
  type ApproveFixes,
  type ChapterSubmission,
  useInvalidateReview,
} from "@/features/uploads/api/submissions"
import { RejectNoteField } from "@/features/uploads/components/chapter-reviews/reject-note-field"
import { ReviewActions } from "@/features/uploads/components/chapter-reviews/review-actions"
import { ReviewFixFields } from "@/features/uploads/components/chapter-reviews/review-fix-fields"
import { ReviewPreview } from "@/features/uploads/components/chapter-reviews/review-preview"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  body: {
    gap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "minmax(0, 1fr) 18rem",
    },
  },
  fields: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function ReviewForm({
  submission,
  can,
  onDone,
}: {
  submission: ChapterSubmission
  can: Permissions
  onDone: () => void
}) {
  const invalidate = useInvalidateReview()
  const review = useMutation({
    mutationFn: async ({
      id,
      fixes,
      reason: note,
    }: {
      id: string
      fixes?: ApproveFixes
      reason?: string
    }) =>
      ensureSuccess(
        note === undefined
          ? await api.chapters[":id"].approve.$post({ param: { id }, json: fixes ?? {} })
          : await api.chapters[":id"].reject.$post({ param: { id }, json: { reason: note } }),
      ),
    onSuccess: invalidate,
  })
  const [number, setNumber] = useState(String(submission.number))
  const [volume, setVolume] = useState(submission.volume ?? "")
  const [title, setTitle] = useState(submission.title ?? "")
  const [language, setLanguage] = useState<Language>(submission.language)
  const [groups, setGroups] = useState<GroupOption[]>(submission.groups)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const parsedNumber = Number(number)
  const numberInvalid = number.trim() === "" || !Number.isFinite(parsedNumber) || parsedNumber < 0

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {m.review_chapter_title({
            media: submission.mediaTitle ?? m.media_untitled(),
            number: submission.number,
          })}
        </DialogTitle>
        <DialogDescription>
          {m.review_chapter_description({ name: submission.uploader.displayUsername })}
        </DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <div sx={styles.body}>
          <ReviewPreview submission={submission} />
          <div sx={styles.fields}>
            <ErrorAlert message={review.isError ? getErrorMessage(review.error) : null} />
            {rejecting ? (
              <RejectNoteField
                onBlur={() => {
                  setTouched(true)
                }}
                onReasonChange={setReason}
                reason={reason}
                rows={5}
                touched={touched}
              />
            ) : (
              <ReviewFixFields
                can={can}
                groups={groups}
                language={language}
                number={number}
                numberInvalid={numberInvalid}
                onGroupsChange={setGroups}
                onLanguageChange={setLanguage}
                onNumberChange={setNumber}
                onTitleChange={setTitle}
                onVolumeChange={setVolume}
                title={title}
                volume={volume}
              />
            )}
          </div>
        </div>
      </DialogPanel>
      <ReviewActions
        approveDisabled={review.isPending || numberInvalid || submission.pageCount === 0}
        onApprove={() => {
          review.mutate(
            {
              id: submission.id,
              fixes: {
                number: parsedNumber,
                volume: volume.trim() === "" ? null : volume.trim(),
                title: title.trim() === "" ? null : title.trim(),
                language,
                groupIds: groups.map((group) => group.id),
              },
            },
            { onSuccess: onDone },
          )
        }}
        onCancelReject={() => {
          setRejecting(false)
        }}
        onReject={() => {
          setTouched(true)

          if (reason.trim() !== "") {
            review.mutate({ id: submission.id, reason: reason.trim() }, { onSuccess: onDone })
          }
        }}
        onStartReject={() => {
          setRejecting(true)
        }}
        pending={review.isPending}
        rejecting={rejecting}
      />
    </>
  )
}
