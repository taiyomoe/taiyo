import type { ReactNode } from "react"
import { useHotkeys } from "@tanstack/react-hotkeys"
import { lazy, Suspense, useEffect, useState } from "react"
import { createCommandRegistry } from "@/features/command-palette/lib/command-registry"
import { PaletteContext } from "@/features/command-palette/lib/palette-context"
import { appHotkeys } from "@/lib/app-hotkeys"

// The palette downloads once the browser is idle, so it still opens at once on the first shortcut.
const CommandPalette = lazy(async () => ({
  default: (await import("@/features/command-palette/components/command-palette")).CommandPalette,
}))

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [registry] = useState(createCommandRegistry)
  const [state, setState] = useState({ open: false, initialQuery: "" })
  const [warm, setWarm] = useState(false)
  const setOpen = (open: boolean) => {
    setState({ open, initialQuery: "" })
  }

  useEffect(() => {
    const warmUp = () => {
      setWarm(true)
    }

    if (typeof requestIdleCallback === "undefined") {
      const timer = setTimeout(warmUp, 1500)

      return () => {
        clearTimeout(timer)
      }
    }

    const handle = requestIdleCallback(warmUp, { timeout: 2000 })

    return () => {
      cancelIdleCallback(handle)
    }
  }, [])

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
      {warm || state.open ? (
        <Suspense>
          <CommandPalette
            initialQuery={state.initialQuery}
            onOpenChange={setOpen}
            open={state.open}
          />
        </Suspense>
      ) : null}
    </PaletteContext>
  )
}
