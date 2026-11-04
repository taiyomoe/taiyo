import { useMemo, useSyncExternalStore } from "react"
import {
  DEFAULT_READER_SETTINGS,
  type ReaderSettings,
  readerSettingsSchema,
} from "@/features/reader/lib/reader-settings"

const STORAGE_KEY = "taiyo:reader-settings"
const listeners = new Set<() => void>()
let cached: ReaderSettings | null = null
let storable = true
const readSettings = () => {
  if (cached === null) {
    try {
      cached = readerSettingsSchema.parse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"))
    } catch {
      cached = DEFAULT_READER_SETTINGS
    }
  }

  return cached
}
const writeSettings = (next: ReaderSettings) => {
  cached = next

  for (const listener of listeners) {
    listener()
  }

  if (storable) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      storable = false
    }
  }
}
const subscribe = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cached = null
      listener()
    }
  }

  listeners.add(listener)
  window.addEventListener("storage", onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function useReaderSettings(longStrip: boolean) {
  const stored = useSyncExternalStore(subscribe, readSettings, () => DEFAULT_READER_SETTINGS)
  const settings = useMemo(
    () => (longStrip ? { ...stored, mode: stored.longStripMode } : stored),
    [longStrip, stored],
  )

  return {
    settings,
    longStrip,
    update: ({ mode, ...patch }: Partial<ReaderSettings>) => {
      const modeKey = longStrip ? "longStripMode" : "mode"

      writeSettings({
        ...readSettings(),
        ...patch,
        ...(mode === undefined ? {} : { [modeKey]: mode }),
      })
    },
    reset: (keys?: ReadonlyArray<keyof ReaderSettings>) => {
      writeSettings(
        keys === undefined
          ? DEFAULT_READER_SETTINGS
          : {
              ...readSettings(),
              ...Object.fromEntries(keys.map((key) => [key, DEFAULT_READER_SETTINGS[key]])),
            },
      )
    },
  }
}

export type ReaderSettingsControls = ReturnType<typeof useReaderSettings>
