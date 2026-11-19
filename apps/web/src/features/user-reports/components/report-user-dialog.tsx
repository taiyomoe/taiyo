import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { USER_REPORT_REASONS, type UserReportReason } from "@taiyomoe/db/constants"
import { Flag } from "@taiyomoe/ui/components/icons"
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
  DialogTrigger,
} from "@taiyomoe/ui/components/ui/dialog"
import { Radio, RadioGroup } from "@taiyomoe/ui/components/ui/radio-group"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { ModeratedUser } from "@/features/users/components/users/moderate-profile-dialog"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { renderWithName } from "@/components/user-name/with-name"
import { useReportUser } from "@/features/user-reports/api/user-reports"
import { USER_REPORT_REASON_OPTIONS } from "@/features/user-reports/lib/user-report-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  title: {
    overflowWrap: "anywhere",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "100%",
    minHeight: 0,
  },
  fields: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  reasons: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  reason: {
    borderColor: {
      default: colors.border,
      ":has([data-checked])": colors.primary,
    },
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":has([data-checked])": `color-mix(in srgb, ${colors.primary} 8%, transparent)`,
      ":hover": `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    },
    cursor: "pointer",
    display: "flex",
    fontSize: "0.9375rem",
    fontWeight: 500,
    transitionDuration: motion.enter,
    transitionProperty: "border-color, background-color",
  },
})

/** Reports a profile to the moderators, from a flag button that opens the form. */
export function ReportUserDialog({
  user,
}: {
  user: Pick<ModeratedUser, "id" | "displayUsername" | "nameEffect">
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<UserReportReason | null>(null)
  const [details, setDetails] = useState("")
  const report = useReportUser(user.id)

  return (
    <Dialog
      onOpenChange={setOpen}
      onOpenChangeComplete={(next) => {
        if (!next) {
          report.reset()
          setReason(null)
          setDetails("")
        }
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button
            aria-label={m.group_report()}
            size="icon"
            title={m.group_report()}
            variant="outline"
          >
            <Flag />
          </Button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle sx={styles.title}>{renderWithName(m.group_report_title, user)}</DialogTitle>
          <DialogDescription>
            {m.user_report_description()}{" "}
            {m.report_reward_hint({ points: config.reports.rewardPoints })}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()

            if (reason !== null) {
              report.mutate(
                { reason, details: details.trim() },
                {
                  onSuccess: () => {
                    toastManager.add({
                      title: m.user_report_sent(),
                      description: m.group_report_sent(),
                      type: "success",
                    })
                    setOpen(false)
                  },
                },
              )
            }
          }}
          sx={styles.form}
        >
          <DialogPanel>
            <div sx={styles.fields}>
              <ErrorAlert
                message={
                  report.isError
                    ? getErrorMessage(report.error, {
                        USER_REPORT_EXISTS: m.user_report_exists,
                        RATE_LIMITED: m.user_report_rate_limited,
                      })
                    : null
                }
              />
              <RadioGroup
                aria-label={m.group_report_reason()}
                onValueChange={(value) => {
                  setReason(USER_REPORT_REASONS.find((entry) => entry === value) ?? null)
                }}
                sx={styles.reasons}
                value={reason}
              >
                {USER_REPORT_REASONS.map((value) => (
                  <label key={value} sx={styles.reason}>
                    <Radio value={value} />
                    {USER_REPORT_REASON_OPTIONS.label(value)}
                  </label>
                ))}
              </RadioGroup>
              <Textarea
                aria-label={m.group_report_details()}
                maxLength={2000}
                onChange={(event) => {
                  setDetails(event.target.value)
                }}
                placeholder={m.group_report_details()}
                rows={3}
                value={details}
              />
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {m.cancel()}
            </DialogClose>
            <Button disabled={reason === null} loading={report.isPending} type="submit">
              {m.group_report_submit()}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
