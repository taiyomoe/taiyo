import type { ReactNode } from "react"
import { useHotkeys } from "@tanstack/react-hotkeys"
import { useState } from "react"
import { CommandPalette } from "@/features/command-palette/components/command-palette"
import { createCommandRegistry } from "@/features/command-palette/lib/command-registry"
import { PaletteContext } from "@/features/command-palette/lib/palette-context"
import { appHotkeys } from "@/lib/app-hotkeys"

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [registry] = useState(createCommandRegistry)
  const [state, setState] = useState({ open: false, initialQuery: "" })
  const setOpen = (open: boolean) => {
    setState({ open, initialQuery: "" })
  }

  useHotkeys([
    {
      hotkey: appHotkeys["palette.toggle"],
      callback: () => {
        setOpen(true)
      },
    },
    {
      hotkey: appHotkeys["palette.search"],
      callback: () => {
        setOpen(true)
      },
    },
  ])

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
