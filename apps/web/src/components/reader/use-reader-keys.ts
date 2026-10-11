import { useEffect } from "react"

export type ReaderKeyHandlers = {
  onPrevious: () => void
  onNext: () => void
  onExit: () => void
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

export function useReaderKeys({ onPrevious, onNext, onExit }: ReaderKeyHandlers) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) {
        return
      }

      if (event.key === "ArrowLeft" || event.key === "k") {
        onPrevious()
      } else if (event.key === "ArrowRight" || event.key === "j") {
        onNext()
      } else if (event.key === "Escape") {
        onExit()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onPrevious, onNext, onExit])
}
