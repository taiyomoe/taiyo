import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { SubmissionRow } from "@/features/uploads/components/submission-row"
import { m } from "@/paraglide/messages"

type ReviewQueueRowProps = {
  submission: ChapterSubmission
  selected: boolean
  onSelect: (checked: boolean) => void
  onReview: () => void
}

export function ReviewQueueRow({ submission, selected, onSelect, onReview }: ReviewQueueRowProps) {
  return (
    <SubmissionRow
      actions={
        <Button onClick={onReview} size="sm">
          {m.review_chapter()}
        </Button>
      }
      leading={
        <Checkbox
          aria-label={m.review_chapter_title({
            media: submission.mediaTitle ?? m.media_untitled(),
            number: submission.number,
          })}
          checked={selected}
          onCheckedChange={onSelect}
        />
      }
      showUploader
      submission={submission}
    />
  )
}
