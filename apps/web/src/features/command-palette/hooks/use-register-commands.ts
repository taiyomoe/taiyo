import { useEffect, useId } from "react"
import type { PaletteCommand } from "@/features/command-palette/lib/palette-command"
import { usePalette } from "@/features/command-palette/lib/palette-context"

export function useRegisterCommands(commands: readonly PaletteCommand[]) {
  const { registry } = usePalette()
  const sourceId = useId()

  useEffect(() => {
    registry.set(sourceId, commands)
  })

  useEffect(
    () => () => {
      registry.delete(sourceId)
    },
    [registry, sourceId],
  )
}
