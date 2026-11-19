import * as stylex from "@stylexjs/stylex"
import { Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { DeleteListsDialog } from "@/features/lists/components/delete-lists-dialog"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  label: {
    display: { default: "none", [breakpoints.sm]: "inline" },
  },
})

export function DeleteListButton({
  list,
}: {
  list: { id: string; name: string; upvoteCount: number }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
        aria-label={m.list_editor_delete()}
        type="button"
        variant="destructive-outline"
      >
        <Trash />
        <span sx={styles.label}>{m.list_editor_delete()}</span>
      </Button>
      <DeleteListsDialog
        lists={open ? [list] : null}
        onClose={() => {
          setOpen(false)
        }}
        onDone={(result) => {
          if (result.done.includes(list.id)) {
            void navigate({ to: "/lists", ignoreBlocker: true }).then(() => {
              queryClient.removeQueries({ queryKey: ["lists", "detail", list.id] })
            })
          }
        }}
      />
    </>
  )
}
