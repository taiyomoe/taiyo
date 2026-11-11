import { useEffect, useEffectEvent } from "react"

export type ReaderKeyAction =
  | "left"
  | "right"
  | "next"
  | "prev"
  | "first"
  | "last"
  | "prevChapter"
  | "nextChapter"
  | "menu"
  | "fullscreen"
  | "cycleMode"
  | "autoScroll"
  | "zoomIn"
  | "zoomOut"
  | "zoomReset"
  | "bookmark"

const KEYS: Record<string, ReaderKeyAction> = {
  ArrowLeft: "left",
  a: "left",
  ArrowRight: "right",
  d: "right",
  " ": "next",
  PageDown: "next",
  PageUp: "prev",
  Home: "first",
  End: "last",
  "[": "prevChapter",
  "]": "nextChapter",
  m: "menu",
  f: "fullscreen",
  l: "cycleMode",
  s: "autoScroll",
  "+": "zoomIn",
  "=": "zoomIn",
  "-": "zoomOut",
  "0": "zoomReset",
  b: "bookmark",
}
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest("input, textarea, select, [role='combobox']") !== null)

export function useReaderKeyboard({
  enabled,
  onAction,
}: {
  enabled: boolean
  onAction: (action: ReaderKeyAction, event: KeyboardEvent) => void
}) {
  const handle = useEffectEvent(onAction)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    // Browser autofill dispatches plain `keydown` events that carry no `key`.
    const onKeyDown = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const action = event.shiftKey && key === " " ? "prev" : KEYS[key]

      if (
        action === undefined ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isTyping(event.target) ||
        (key === " " && event.target instanceof HTMLButtonElement)
      ) {
        return
      }

      handle(action, event)
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [enabled])
}

export const READER_SHORTCUTS = [
  { keys: ["←", "→"], action: "turn" },
  { keys: ["A", "D"], action: "turn" },
  { keys: ["Space"], action: "next" },
  { keys: ["Shift", "Space"], action: "prev" },
  { keys: ["Home", "End"], action: "edges" },
  { keys: ["[", "]"], action: "chapter" },
  { keys: ["M"], action: "menu" },
  { keys: ["F"], action: "fullscreen" },
  { keys: ["L"], action: "layout" },
  { keys: ["S"], action: "autoScroll" },
  { keys: ["+", "-"], action: "zoom" },
  { keys: ["0"], action: "zoomReset" },
  { keys: ["B"], action: "bookmark" },
] as const
