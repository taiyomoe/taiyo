import * as stylex from "@stylexjs/stylex"
import { ArrowRight } from "@taiyomoe/ui/components/icons"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@taiyomoe/ui/components/ui/number-field"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { ManagedUser } from "@/features/users/api/users"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { PointsAmount } from "@/features/shop/components/points-amount"
import { useGiveUsersPoints } from "@/features/users/api/users"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const MAX_POINTS = 1_000_000
const styles = stylex.create({
  balance: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
})

export function PointsDialog({
  users,
  onClose,
  onDone,
}: {
  users: readonly ManagedUser[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const give = useGiveUsersPoints()
  const [mode, setMode] = useState<"add" | "remove">("add")
  const [amount, setAmount] = useState<number | null>(100)
  const [only] = users ?? []
  const delta = (amount ?? 0) * (mode === "add" ? 1 : -1)
  const close = () => {
    give.reset()
    setMode("add")
    setAmount(100)
    onClose()
  }

  return (
    <BulkEditDialog
      changed={delta !== 0}
      description={m.users_points_dialog_description()}
      error={give.isError ? getErrorMessage(give.error) : null}
      onClose={close}
      onSubmit={() => {
        if (users !== null && delta !== 0) {
          give.mutate(
            { userIds: users.map((user) => user.id), amount: delta },
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.users_bulk_updated)
                onDone?.()
                close()
              },
            },
          )
        }
      }}
      open={users !== null}
      pending={give.isPending}
      title={
        users?.length === 1 && only !== undefined
          ? m.users_points_dialog_title_one({ name: only.displayUsername })
          : m.users_points_dialog_title({ count: users?.length ?? 0 })
      }
    >
      <SegmentedControl
        aria-label={m.users_points_mode()}
        fullWidth
        onValueChange={(value: unknown) => {
          setMode(value === "remove" ? "remove" : "add")
        }}
        value={mode}
      >
        <SegmentedControlItem value="add">{m.users_points_add()}</SegmentedControlItem>
        <SegmentedControlItem value="remove">{m.users_points_remove()}</SegmentedControlItem>
      </SegmentedControl>
      <Field>
        <FieldLabel>{m.users_points_amount()}</FieldLabel>
        <NumberField
          max={MAX_POINTS}
          min={1}
          onValueChange={(value) => {
            setAmount(value === null ? null : Math.round(value))
          }}
          step={50}
          value={amount}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        {mode === "remove" ? <FieldDescription>{m.users_points_floor()}</FieldDescription> : null}
      </Field>
      {users?.length === 1 && only !== undefined ? (
        <div sx={styles.balance}>
          {m.users_points_balance()}
          <PointsAmount points={only.points} />
          <ArrowRight size={14} />
          <PointsAmount points={Math.max(0, only.points + delta)} />
        </div>
      ) : null}
    </BulkEditDialog>
  )
}
