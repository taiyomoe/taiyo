import { config } from "@taiyomoe/config"
import { CheckCircle, Info } from "@taiyomoe/ui/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import type { ReleaseSettings } from "@/features/uploads/lib/chapter-batch/release"
import { m } from "@/paraglide/messages"

type PublishAlertProps = {
  publishes: boolean
  mode: ReleaseSettings["mode"]
  pendingCount: number | undefined
  slotsLeft: number
}

const PUBLISH_TITLES: Record<ReleaseSettings["mode"], () => string> = {
  now: m.upload_will_publish,
  date: m.uploads_state_scheduled,
  delay: m.uploads_state_scheduled,
}

export function PublishAlert({ publishes, mode, pendingCount, slotsLeft }: PublishAlertProps) {
  const scheduled = mode !== "now"
  let releaseDescription = m.upload_will_review_description()

  if (publishes && scheduled) {
    releaseDescription = m.upload_will_schedule_description()
  } else if (publishes) {
    releaseDescription = m.upload_will_publish_description()
  } else if (scheduled) {
    releaseDescription = m.upload_will_review_scheduled_description()
  }

  return (
    <Alert variant={publishes ? "success" : "info"}>
      {publishes ? <CheckCircle /> : <Info />}
      <AlertTitle>{publishes ? PUBLISH_TITLES[mode]() : m.upload_will_review()}</AlertTitle>
      <AlertDescription>
        {releaseDescription}
        {publishes || pendingCount === undefined
          ? null
          : ` ${m.upload_slots_left({ count: slotsLeft, max: config.input.maxPendingChapters })}`}
      </AlertDescription>
    </Alert>
  )
}
