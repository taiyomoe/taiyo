import { createContext, use } from "react"
import type { CommandRegistry } from "@/features/command-palette/lib/command-registry"

export type PaletteContextValue = {
  open: boolean
  openPalette: (initialQuery?: string) => void
  setOpen: (open: boolean) => void
  registry: CommandRegistry
}

export const PaletteContext = createContext<PaletteContextValue | null>(null)

export const usePalette = () => {
  const value = use(PaletteContext)

  if (value === null) {
    throw new Error("usePalette must be used inside CommandPaletteProvider")
  }

  return value
}
