import { type ReaderSettings, readerSettingsSchema } from "@taiyomoe/schemas/reader-settings"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useSyncExternalStore } from "react"
import { readerSettingsQueryOptions, saveReaderSettings } from "@/features/reader/api/reader"
import { DEFAULT_READER_SETTINGS } from "@/features/reader/lib/reader-settings"

const STORAGE_KEY = "taiyo:reader-settings"
const PUSH_DELAY_MS = 800
const listeners = new Set<() => void>()
let cached: ReaderSettings | null = null
let storable = true
let edited = false
let remoteSettled = false
let pendingPush: ReturnType<typeof setTimeout> | undefined
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
const flushPush = (keepalive: boolean) => {
  clearTimeout(pendingPush)
  pendingPush = undefined
  saveReaderSettings(readSettings(), keepalive).catch(() => {})
}
const schedulePush = () => {
  clearTimeout(pendingPush)
  pendingPush = setTimeout(() => {
    flushPush(false)
  }, PUSH_DELAY_MS)
}
const subscribe = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cached = null
      listener()
    }
  }
  const onPageHide = () => {
    if (pendingPush !== undefined) {
      flushPush(true)
    }
  }

  listeners.add(listener)
  window.addEventListener("storage", onStorage)
  window.addEventListener("pagehide", onPageHide)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
    window.removeEventListener("pagehide", onPageHide)
  }
}

export function useReaderSettingsSync(signedIn: boolean) {
  const remote = useQuery({ ...readerSettingsQueryOptions, enabled: signedIn })

  useEffect(() => {
    if (remote.data === undefined || remoteSettled) {
      return
    }

    remoteSettled = true

    if (remote.data.settings === null) {
      if (localStorage.getItem(STORAGE_KEY) !== null) {
        schedulePush()
      }
    } else if (!edited) {
      writeSettings(readerSettingsSchema.parse(remote.data.settings))
    }
  }, [remote.data])
}

export function useReaderSettings(longStrip: boolean, signedIn: boolean) {
  const stored = useSyncExternalStore(subscribe, readSettings, () => DEFAULT_READER_SETTINGS)
  const settings = useMemo(
    () => (longStrip ? { ...stored, mode: stored.longStripMode } : stored),
    [longStrip, stored],
  )
  const save = (next: ReaderSettings) => {
    edited = true
    writeSettings(next)

    if (signedIn) {
      schedulePush()
    }
  }

  return {
    settings,
    longStrip,
    update: ({ mode, ...patch }: Partial<ReaderSettings>) => {
      const modeKey = longStrip ? "longStripMode" : "mode"

      save({
        ...readSettings(),
        ...patch,
        ...(mode === undefined ? {} : { [modeKey]: mode }),
      })
    },
    reset: (keys?: ReadonlyArray<keyof ReaderSettings>) => {
      save(
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
