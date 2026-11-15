import { useSyncExternalStore } from "react"
import { type DateRange, sameRange } from "@/features/activity-log/lib/datemath"

const RECENT_KEY = "taiyo:activity-log:recent-ranges"
const RECENT_LIMIT = 5
const NO_RANGES: DateRange[] = []
const listeners = new Set<() => void>()
let cached: { raw: string | null; ranges: DateRange[] } = { raw: null, ranges: NO_RANGES }
const getRecentRanges = () => {
  const raw = localStorage.getItem(RECENT_KEY)

  if (raw !== cached.raw) {
    let ranges: DateRange[]

    try {
      const parsed: unknown = JSON.parse(raw ?? "[]")

      ranges = Array.isArray(parsed)
        ? parsed
            .filter(
              (value: unknown): value is DateRange =>
                typeof value === "object" &&
                value !== null &&
                "from" in value &&
                "to" in value &&
                typeof value.from === "string" &&
                typeof value.to === "string",
            )
            .slice(0, RECENT_LIMIT)
        : NO_RANGES
    } catch {
      ranges = NO_RANGES
    }

    cached = { raw, ranges }
  }

  return cached.ranges
}
const subscribeToRecentRanges = (listener: () => void) => {
  listeners.add(listener)
  window.addEventListener("storage", listener)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

export const rememberRange = (range: DateRange) => {
  const next = [range, ...getRecentRanges().filter((entry) => !sameRange(entry, range))].slice(
    0,
    RECENT_LIMIT,
  )

  localStorage.setItem(RECENT_KEY, JSON.stringify(next))

  for (const listener of listeners) {
    listener()
  }
}

export const useRecentRanges = () =>
  useSyncExternalStore(subscribeToRecentRanges, getRecentRanges, () => NO_RANGES)
