import { useEffect } from "react"

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

export function usePaletteHotkey({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  useEffect(() => {
    // Browser autofill dispatches plain `keydown` events that carry no `key`.
    const onKeyDown = (event: Event) => {
      if (!(event instanceof KeyboardEvent) || event.defaultPrevented || event.isComposing) {
        return
      }

      const chord =
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      const slash = event.key === "/" && !open && !isEditable(event.target)

      if (chord || slash) {
        event.preventDefault()
        onToggle()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onToggle])
}
