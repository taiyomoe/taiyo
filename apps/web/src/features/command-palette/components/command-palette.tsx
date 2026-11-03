import * as stylex from "@stylexjs/stylex"
import { CommandDialog, CommandDialogPopup } from "@taiyomoe/ui/components/ui/command"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useRef, useState } from "react"
import { PaletteBody } from "@/features/command-palette/components/palette-body"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    maxHeight: { default: "min(36rem, 80dvh)", [breakpoints.maxSm]: "none" },
    maxWidth: { default: "42rem", [breakpoints.lg]: "62rem", [breakpoints.maxSm]: "none" },
  },
})

export function CommandPalette({
  open,
  initialQuery,
  onOpenChange,
}: {
  open: boolean
  initialQuery: string
  onOpenChange: (open: boolean) => void
}) {
  const escapeRef = useRef<(() => boolean) | null>(null)
  const [warm, setWarm] = useState(false)

  useEffect(() => {
    const handle = requestIdleCallback(
      () => {
        setWarm(true)
      },
      { timeout: 2000 },
    )

    return () => {
      cancelIdleCallback(handle)
    }
  }, [])

  return (
    <CommandDialog
      onOpenChange={(next, details) => {
        if (!next && details.reason === "escape-key" && escapeRef.current?.() === true) {
          details.cancel()

          return
        }

        onOpenChange(next)
      }}
      open={open}
    >
      <CommandDialogPopup
        aria-label={m.palette_label()}
        portalProps={{ keepMounted: true }}
        sx={styles.popup}
      >
        {warm || open ? (
          <PaletteBody
            escapeRef={escapeRef}
            initialQuery={initialQuery}
            open={open}
            onClose={() => {
              onOpenChange(false)
            }}
          />
        ) : null}
      </CommandDialogPopup>
    </CommandDialog>
  )
}
