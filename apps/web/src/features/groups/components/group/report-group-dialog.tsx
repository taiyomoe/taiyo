import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { CheckCircle, Flag } from "@taiyomoe/ui/components/icons"
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
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { Group, GroupReportInput } from "@/features/groups/api/groups"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { GROUP_REPORT_REASON_LABELS } from "@/features/groups/lib/group-report-labels"
import { useCurrentHref } from "@/hooks/use-current-href"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type Reason = GroupReportInput["reason"]

const REASONS = ["IMPERSONATION", "STOLEN_WORK", "SPAM", "OTHER"] as const satisfies Reason[]
const styles = stylex.create({
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
  done: {
    gap: "0.75rem",
    paddingBlock: "1rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  doneIcon: {
    color: colors.success,
  },
})

export function ReportGroupDialog({
  group,
  signedIn,
  sx,
  iconOnly = false,
}: {
  group: Group
  signedIn: boolean
  sx?: Sx
  iconOnly?: boolean
}) {
  const href = useCurrentHref()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<Reason | null>(null)
  const [details, setDetails] = useState("")
  const report = useMutation({
    mutationFn: async (json: GroupReportInput) =>
      ensureSuccess(await api.groups[":id"].reports.$post({ param: { id: group.id }, json })),
  })

  if (!signedIn) {
    return (
      <Button
        aria-label={m.group_report()}
        render={<Link search={{ redirect: href }} to="/auth/sign-in" />}
        size={iconOnly ? "icon" : "lg"}
        sx={sx}
        title={m.group_report()}
        variant="outline"
      >
        <Flag />
        {iconOnly ? null : m.group_report()}
      </Button>
    )
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)

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
            size={iconOnly ? "icon" : "lg"}
            sx={sx}
            title={m.group_report()}
            variant="outline"
          >
            <Flag />
            {iconOnly ? null : m.group_report()}
          </Button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.group_report_title({ name: group.name })}</DialogTitle>
          <DialogDescription>{m.group_report_description()}</DialogDescription>
        </DialogHeader>
        {report.isSuccess ? (
          <>
            <DialogPanel>
              <div sx={styles.done}>
                <CheckCircle size={32} {...stylex.props(styles.doneIcon)} />
                {m.group_report_sent()}
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button />}>{m.group_report_done()}</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()

              if (reason !== null) {
                report.mutate({ reason, details: details.trim() })
              }
            }}
            sx={styles.form}
          >
            <DialogPanel>
              <div sx={styles.fields}>
                <ErrorAlert message={report.isError ? getErrorMessage(report.error) : null} />
                <RadioGroup
                  aria-label={m.group_report_reason()}
                  onValueChange={(value) => {
                    setReason(REASONS.find((entry) => entry === value) ?? null)
                  }}
                  sx={styles.reasons}
                  value={reason}
                >
                  {REASONS.map((value) => (
                    <label key={value} sx={styles.reason}>
                      <Radio value={value} />
                      {GROUP_REPORT_REASON_LABELS[value]()}
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
        )}
      </DialogPopup>
    </Dialog>
  )
}
