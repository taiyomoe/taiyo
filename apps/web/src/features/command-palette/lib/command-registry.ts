import type { PaletteCommand } from "@/features/command-palette/lib/palette-command"

const signatureOf = (commands: readonly PaletteCommand[]) =>
  commands
    .map((command) =>
      [command.id, command.label, command.hint, command.checked, command.keywords?.join(",")].join(
        "\u0000",
      ),
    )
    .join("\u0001")

export function createCommandRegistry() {
  const sources = new Map<string, readonly PaletteCommand[]>()
  const listeners = new Set<() => void>()
  let snapshot: readonly PaletteCommand[] = []
  let signature = ""
  const refresh = () => {
    snapshot = [...sources.values()].flat()

    const next = signatureOf(snapshot)

    if (next !== signature) {
      signature = next

      for (const listener of listeners) {
        listener()
      }
    }
  }

  return {
    set: (sourceId: string, commands: readonly PaletteCommand[]) => {
      sources.set(sourceId, commands)
      refresh()
    },
    delete: (sourceId: string) => {
      sources.delete(sourceId)
      refresh()
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => snapshot,
    find: (commandId: string) => snapshot.find((command) => command.id === commandId),
  }
}

export type CommandRegistry = ReturnType<typeof createCommandRegistry>
