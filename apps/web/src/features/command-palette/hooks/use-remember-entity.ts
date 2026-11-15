import { useEffect } from "react"
import type { PaletteEntity } from "@/features/command-palette/lib/palette-command"
import { rememberEntity } from "@/features/command-palette/lib/recent-entities"

export function useRememberEntity(entity: PaletteEntity | null) {
  useEffect(() => {
    if (entity !== null) {
      rememberEntity(entity)
    }
  })
}
