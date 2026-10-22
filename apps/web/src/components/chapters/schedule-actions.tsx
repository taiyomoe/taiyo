import * as stylex from "@stylexjs/stylex"
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
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import { AuthAlert } from "@/components/auth/auth-alert"
import { type Confirmation, ConfirmDialog } from "@/components/dashboard/confirm-dialog"
import { DateTimePicker } from "@/components/fields/date-time-picker"
import { getErrorMessage } from "@/lib/errors"
import { useScheduleChapter } from "@/lib/queries/submissions"
import { useNow } from "@/lib/use-now"
import { m } from "@/paraglide/messages"

type ScheduledChapter = { id: string; number: number; publishAt: string }

const styles = stylex.create({
  form: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

function RescheduleForm({ chapter, onDone }: { chapter: ScheduledChapter; onDone: () => void }) {
  const schedule = useScheduleChapter()
  const [date, setDate] = useState(() => new Date(chapter.publishAt))
  const [attempted, setAttempted] = useState(false)
  const now = useNow()
  const past = date.getTime() <= now

  return (
    <>
      <DialogHeader>
        <DialogTitle>{m.upcoming_reschedule_title({ number: chapter.number })}</DialogTitle>
        <DialogDescription>{m.upcoming_reschedule_description()}</DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <div sx={styles.form}>
          <AuthAlert message={schedule.isError ? getErrorMessage(schedule.error) : null} />
          <Field invalid={attempted && past}>
            <FieldLabel>{m.upload_release()}</FieldLabel>
            <DateTimePicker
              invalid={attempted && past}
              label={m.upload_release()}
              onChange={setDate}
              value={date}
            />
            {attempted && past ? <FieldError match>{m.upload_release_past()}</FieldError> : null}
          </Field>
        </div>
      </DialogPanel>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
        <Button
          disabled={schedule.isPending}
          onClick={() => {
            setAttempted(true)

            if (!past) {
              schedule.mutate(
                { id: chapter.id, publishAt: date.toISOString() },
                { onSuccess: onDone },
              )
            }
          }}
        >
          {m.save()}
        </Button>
      </DialogFooter>
    </>
  )
}

export function ScheduleActions({ chapter }: { chapter: ScheduledChapter }) {
  const release = useScheduleChapter()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [rescheduling, setRescheduling] = useState(false)

  return (
    <>
      <Button
        onClick={() => {
          setConfirmation({
            title: m.upcoming_release_now_title({ number: chapter.number }),
            description: m.upcoming_release_now_description(),
            confirmLabel: m.upcoming_release_now(),
            run: () => release.mutateAsync({ id: chapter.id, publishAt: null }),
          })
        }}
        size="sm"
        variant="ghost"
      >
        {m.upcoming_release_now()}
      </Button>
      <Button
        onClick={() => {
          setRescheduling(true)
        }}
        size="sm"
        variant="ghost"
      >
        {m.upcoming_reschedule()}
      </Button>
      <ConfirmDialog
        confirmation={confirmation}
        error={release.isError ? getErrorMessage(release.error) : null}
        onClose={() => {
          setConfirmation(null)
          release.reset()
        }}
        pending={release.isPending}
      />
      <Dialog onOpenChange={setRescheduling} open={rescheduling}>
        <DialogPopup>
          {rescheduling ? (
            <RescheduleForm
              chapter={chapter}
              onDone={() => {
                setRescheduling(false)
              }}
            />
          ) : null}
        </DialogPopup>
      </Dialog>
    </>
  )
}
