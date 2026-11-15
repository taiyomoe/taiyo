import * as stylex from "@stylexjs/stylex"
import { Smile } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { lazy, Suspense, useState } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  panel: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    height: "25.5rem",
    width: "min(21rem, calc(100vw - 4rem))",
  },
})
const EmojiPickerPanel = lazy(() => import("@/features/comments/components/emoji-picker-panel"))

export function EmojiPickerButton({
  disabled,
  onPick,
}: {
  disabled?: boolean | undefined
  onPick: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-label={m.comments_emoji()}
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            size="icon-sm"
            title={m.comments_emoji()}
            variant="ghost"
          />
        }
      >
        <Smile />
      </PopoverTrigger>
      <PopoverPopup align="end" side="top">
        <div sx={styles.panel}>
          <Suspense fallback={<Spinner />}>
            <EmojiPickerPanel
              onPick={(emoji) => {
                setOpen(false)
                onPick(emoji)
              }}
            />
          </Suspense>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
