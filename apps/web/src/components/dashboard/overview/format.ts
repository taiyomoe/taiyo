import type { DashboardOverview } from "@/lib/queries/dashboard"
import { getLocale } from "@/paraglide/runtime"

type Unit = DashboardOverview["unit"]

const TICK_FORMATS: Record<Unit, Intl.DateTimeFormatOptions> = {
  hour: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  day: { month: "short", day: "numeric" },
  week: { month: "short", day: "numeric" },
  month: { month: "short" },
}
const TITLE_FORMATS: Record<Unit, Intl.DateTimeFormatOptions> = {
  hour: { weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  day: { weekday: "short", month: "short", day: "numeric" },
  week: { month: "short", day: "numeric", year: "numeric" },
  month: { month: "long", year: "numeric" },
}

export const formatCompact = (value: number) =>
  new Intl.NumberFormat(getLocale(), { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  )

export const formatNumber = (value: number) => new Intl.NumberFormat(getLocale()).format(value)

export const formatPercent = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat(getLocale(), { style: "percent", maximumFractionDigits }).format(value)

export const getDelta = (current: number, previous: number) =>
  previous === 0 ? null : (current - previous) / previous

export const formatBucketTick = (iso: string, unit: Unit) =>
  new Intl.DateTimeFormat(getLocale(), TICK_FORMATS[unit]).format(new Date(iso))

export const formatBucketTitle = (iso: string, unit: Unit) =>
  new Intl.DateTimeFormat(getLocale(), TITLE_FORMATS[unit]).format(new Date(iso))

export const pickTicks = <T>(values: readonly T[], count: number) => {
  if (values.length <= count + 1) {
    return [...values]
  }

  const step = Math.ceil((values.length - 1) / (count - 1))

  return values.filter((_, index) => (values.length - 1 - index) % step === 0)
}
