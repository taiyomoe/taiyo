import type { ReactNode } from "react"
import { useState } from "react"
import { CommandPalette } from "@/features/command-palette/components/command-palette"
import { usePaletteHotkey } from "@/features/command-palette/hooks/use-palette-hotkey"
import { createCommandRegistry } from "@/features/command-palette/lib/command-registry"
import { PaletteContext } from "@/features/command-palette/lib/palette-context"

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [registry] = useState(createCommandRegistry)
  const [state, setState] = useState({ open: false, initialQuery: "" })
  const setOpen = (open: boolean) => {
    setState({ open, initialQuery: "" })
  }

  usePaletteHotkey({
    open: state.open,
    onToggle: () => {
      setState((current) => ({ open: !current.open, initialQuery: "" }))
    },
  })

  return (
    <PaletteContext
      value={{
        open: state.open,
        openPalette: (initialQuery = "") => {
          setState({ open: true, initialQuery })
        },
        setOpen,
        registry,
      }}
    >
      {children}
      <CommandPalette initialQuery={state.initialQuery} onOpenChange={setOpen} open={state.open} />
    </PaletteContext>
  )
}
