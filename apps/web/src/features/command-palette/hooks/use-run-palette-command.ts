import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useRouter } from "@tanstack/react-router"
import type { PaletteRun } from "@/features/command-palette/lib/palette-command"
import { m } from "@/paraglide/messages"

export function useRunPaletteCommand(onClose: () => void) {
  const router = useRouter()

  return (run: Exclude<PaletteRun, { type: "page" }>, { newTab = false } = {}) => {
    onClose()

    switch (run.type) {
      case "navigate":
        if (newTab) {
          window.open(router.buildLocation(run.to).href, "_blank", "noopener")
        } else {
          void router.navigate(run.to)
        }

        return

      case "external":
        window.open(run.href, "_blank", "noopener,noreferrer")

        return

      case "copy":
        void navigator.clipboard.writeText(run.text()).then(
          () => toastManager.add({ title: m.palette_copied(), type: "success" }),
          () => toastManager.add({ title: m.palette_copy_failed(), type: "error" }),
        )

        return

      case "perform":
        void Promise.resolve()
          .then(run.perform)
          .catch((error: unknown) =>
            toastManager.add({
              title: m.palette_failed(),
              description: error instanceof Error ? error.message : undefined,
              type: "error",
            }),
          )
    }
  }
}
