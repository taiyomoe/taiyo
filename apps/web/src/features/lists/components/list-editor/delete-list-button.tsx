import * as stylex from "@stylexjs/stylex"
import { Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { useDeleteList } from "@/features/lists/api/lists"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  label: {
    display: { default: "none", [breakpoints.sm]: "inline" },
  },
})

export function DeleteListButton({ list }: { list: { id: string; name: string } }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const remove = useDeleteList()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  return (
    <>
      <Button
        onClick={() => {
          setConfirmation({
            title: m.list_editor_delete_title(),
            description: m.list_editor_delete_description({ name: list.name }),
            confirmLabel: m.list_editor_delete(),
            destructive: true,
            run: async () => {
              await remove.mutateAsync(list.id)
              toastManager.add({ title: m.list_editor_deleted(), type: "success" })
              await navigate({ to: "/lists", ignoreBlocker: true })
              queryClient.removeQueries({ queryKey: ["lists", "detail", list.id] })
            },
          })
        }}
        aria-label={m.list_editor_delete()}
        type="button"
        variant="destructive-outline"
      >
        <Trash />
        <span sx={styles.label}>{m.list_editor_delete()}</span>
      </Button>
      <ConfirmDialog
        confirmation={confirmation}
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirmation(null)
          remove.reset()
        }}
        pending={remove.isPending}
      />
    </>
  )
}
