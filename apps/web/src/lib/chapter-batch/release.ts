import { m } from "../../paraglide/messages"

export const RELEASE_MODES = ["now", "date", "delay"] as const

export const RELEASE_UNITS = ["hours", "days"] as const

export type ReleaseMode = (typeof RELEASE_MODES)[number]

export type ReleaseUnit = (typeof RELEASE_UNITS)[number]

export type ReleaseSettings = {
  mode: ReleaseMode
  date: Date | null
  delay: string
  delayUnit: ReleaseUnit
  spaced: boolean
  spacing: string
  spacingUnit: ReleaseUnit
}

export type ReleasePlan = { error: string | null; at: (index: number) => Date | null }

export const DEFAULT_RELEASE: ReleaseSettings = {
  mode: "now",
  date: null,
  delay: "7",
  delayUnit: "days",
  spaced: false,
  spacing: "1",
  spacingUnit: "days",
}

const UNIT_MS: Record<ReleaseUnit, number> = { hours: 3_600_000, days: 86_400_000 }
const RIGHT_AWAY: ReleasePlan = { error: null, at: () => null }
const amountOf = (value: string) => {
  const amount = Number(value.replace(",", "."))

  return value.trim() !== "" && Number.isFinite(amount) && amount > 0 ? amount : null
}
const failed = (error: string): ReleasePlan => ({ error, at: () => null })

export const planRelease = (settings: ReleaseSettings, now: number): ReleasePlan => {
  if (settings.mode === "now") {
    return RIGHT_AWAY
  }

  const delay = amountOf(settings.delay)
  const spacing = settings.spaced ? amountOf(settings.spacing) : 0

  if (settings.mode === "date" && settings.date === null) {
    return failed(m.upload_release_missing())
  }

  if ((settings.mode === "delay" && delay === null) || spacing === null) {
    return failed(m.upload_release_amount_invalid())
  }

  const start =
    settings.mode === "date"
      ? (settings.date?.getTime() ?? now)
      : now + (delay ?? 0) * UNIT_MS[settings.delayUnit]

  if (start <= now) {
    return failed(m.upload_release_past())
  }

  return {
    error: null,
    at: (index) => new Date(start + index * spacing * UNIT_MS[settings.spacingUnit]),
  }
}
