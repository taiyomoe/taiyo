// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
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
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { ManagedUser } from "@/features/users/api/users"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { dialogStyles } from "@/features/users/components/users/dialog-styles"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const BAN_LENGTHS = [
  { value: "1", days: 1, label: m.ban_length_day },
  { value: "7", days: 7, label: m.ban_length_week },
  { value: "30", days: 30, label: m.ban_length_month },
  { value: "365", days: 365, label: m.ban_length_year },
  { value: "forever", days: null, label: m.ban_length_forever },
] as const

export function BanDialog({ user, onClose }: { user: ManagedUser | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const ban = useMutation({
    mutationFn: async ({
      userId,
      reason: banReason,
      days,
    }: {
      userId: string
      reason: string
      days: number | null
    }) =>
      ensureSuccess(
        await api.users[":id"].ban.$post({
          param: { id: userId },
          json: { reason: banReason, days },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
  const [reason, setReason] = useState("")
  const [length, setLength] = useState<(typeof BAN_LENGTHS)[number]["value"]>("7")
  const [touched, setTouched] = useState(false)
  const selected = BAN_LENGTHS.find((option) => option.value === length) ?? BAN_LENGTHS[1]
  const close = () => {
    setReason("")
    setTouched(false)
    ban.reset()
    onClose()
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
      open={user !== null}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.users_ban_title({ name: user?.displayUsername ?? "" })}</DialogTitle>
          <DialogDescription>{m.users_ban_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={dialogStyles.form}>
            <ErrorAlert message={ban.isError ? getErrorMessage(ban.error) : null} />
            <Field invalid={touched && reason.trim() === ""}>
              <FieldLabel>{m.users_ban_reason()}</FieldLabel>
              <Textarea
                maxLength={2000}
                onChange={(event) => {
                  setReason(event.target.value)
                }}
                placeholder={m.users_ban_reason_placeholder()}
                rows={3}
                value={reason}
              />
              {touched && reason.trim() === "" ? (
                <FieldError match>{m.users_ban_reason_required()}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel>{m.users_ban_length()}</FieldLabel>
              <Select
                onValueChange={(next) => {
                  if (next !== null) {
                    setLength(next)
                  }
                }}
                value={length}
              >
                <SelectTrigger aria-label={m.users_ban_length()}>
                  <SelectValue>{() => selected.label()}</SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  {BAN_LENGTHS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label()}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={ban.isPending}
            onClick={() => {
              setTouched(true)

              if (user !== null && reason.trim() !== "") {
                ban.mutate(
                  { userId: user.id, reason: reason.trim(), days: selected.days },
                  { onSuccess: close },
                )
              }
            }}
            variant="destructive"
          >
            {m.users_ban()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
