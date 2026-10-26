import type { ReactNode } from "react"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { ScheduleActions } from "@/features/chapters/components/schedule-actions"
import { SubmissionRow } from "@/features/uploads/components/submission-row"
import { m } from "@/paraglide/messages"

type MySubmissionRowProps = {
  submission: ChapterSubmission
  withdrawing: boolean
  onWithdraw: () => void
}

export function MySubmissionRow({ submission, withdrawing, onWithdraw }: MySubmissionRowProps) {
  let actions: ReactNode

  if (submission.status === "SCHEDULED" && submission.publishAt !== null) {
    actions = (
      <ScheduleActions
        chapter={{
          id: submission.id,
          number: submission.number,
          publishAt: submission.publishAt,
        }}
      />
    )
  } else if (submission.status === "PENDING") {
    actions = (
      <Button disabled={withdrawing} onClick={onWithdraw} size="sm" variant="ghost">
        {m.submission_withdraw()}
      </Button>
    )
  }

  return <SubmissionRow actions={actions} submission={submission} />
}
