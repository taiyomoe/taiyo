import type { AuditLogHistogramInterval } from "@taiyomoe/audit/query"
import { type DateMathUnit, parseDateMath } from "@/lib/datemath"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const INTL_UNITS: Record<DateMathUnit, Intl.RelativeTimeFormatUnit> = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year",
}
const UNIT_NAMES: Record<DateMathUnit, () => string> = {
  s: m.activity_unit_seconds,
  m: m.activity_unit_minutes,
  h: m.activity_unit_hours,
  d: m.activity_unit_days,
  w: m.activity_unit_weeks,
  M: m.activity_unit_months,
  y: m.activity_unit_years,
}
const UNIT_SINGULAR: Record<DateMathUnit, () => string> = {
  s: m.activity_unit_second,
  m: m.activity_unit_minute,
  h: m.activity_unit_hour,
  d: m.activity_unit_day,
  w: m.activity_unit_week,
  M: m.activity_unit_month,
  y: m.activity_unit_year,
}

export const COMMON_RANGES: ReadonlyArray<{ from: string; to: string }> = [
  { from: "now/d", to: "now/d" },
  { from: "now/w", to: "now/w" },
  { from: "now-15m", to: "now" },
  { from: "now-30m", to: "now" },
  { from: "now-1h", to: "now" },
  { from: "now-24h", to: "now" },
  { from: "now-7d", to: "now" },
  { from: "now-30d", to: "now" },
  { from: "now-90d", to: "now" },
  { from: "now-1y", to: "now" },
]

export const unitName = (unit: DateMathUnit) => UNIT_NAMES[unit]()

export const unitSingular = (unit: DateMathUnit) => UNIT_SINGULAR[unit]()

export const formatDuration = (amount: number, unit: DateMathUnit) =>
  new Intl.NumberFormat(getLocale(), {
    style: "unit",
    unit: INTL_UNITS[unit],
    unitDisplay: "long",
  }).format(amount)

export const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat(getLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date)

const formatShortDateTime = (date: Date) =>
  new Intl.DateTimeFormat(getLocale(), {
    ...(date.getFullYear() === new Date().getFullYear() ? {} : { year: "numeric" }),
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date)

export const formatTimestamp = (iso: string) => {
  const date = new Date(iso)
  const time = new Intl.DateTimeFormat(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date)
  const day = new Intl.DateTimeFormat(getLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)

  return { day, time, milliseconds: String(date.getMilliseconds()).padStart(3, "0") }
}

export const describeRange = (from: string, to: string) => {
  if (from === "now/d" && to === "now/d") {
    return m.activity_range_today()
  }

  if (from === "now/w" && to === "now/w") {
    return m.activity_range_this_week()
  }

  if (from === "now/M" && to === "now/M") {
    return m.activity_range_this_month()
  }

  if (from === "now/y" && to === "now/y") {
    return m.activity_range_this_year()
  }

  const start = parseDateMath(from)
  const end = parseDateMath(to)

  if (start?.kind !== "relative" || end?.kind !== "relative" || start.round !== null) {
    return null
  }

  if (end.amount === 0 && end.round === null && start.amount < 0) {
    return m.activity_range_last({ duration: formatDuration(-start.amount, start.unit) })
  }

  if (start.amount === 0 && end.amount > 0 && end.round === null) {
    return m.activity_range_next({ duration: formatDuration(end.amount, end.unit) })
  }

  return null
}

export const describeDateMath = (expression: string) => {
  const parsed = parseDateMath(expression)

  if (parsed === null) {
    return expression
  }

  if (parsed.kind === "absolute") {
    return formatShortDateTime(parsed.date)
  }

  const base =
    parsed.amount === 0
      ? m.activity_now()
      : new Intl.RelativeTimeFormat(getLocale(), { numeric: "always" }).format(
          parsed.amount,
          INTL_UNITS[parsed.unit],
        )

  return parsed.round === null
    ? base
    : m.activity_rounded({ base, unit: unitSingular(parsed.round) })
}

const INTERVAL_LABELS: Record<AuditLogHistogramInterval, () => string> = {
  "1m": () => formatDuration(1, "m"),
  "5m": () => formatDuration(5, "m"),
  "10m": () => formatDuration(10, "m"),
  "30m": () => formatDuration(30, "m"),
  "1h": () => formatDuration(1, "h"),
  "3h": () => formatDuration(3, "h"),
  "12h": () => formatDuration(12, "h"),
  "1d": () => formatDuration(1, "d"),
  "1w": () => formatDuration(1, "w"),
  "1M": () => formatDuration(1, "M"),
  "1y": () => formatDuration(1, "y"),
}

export const describeInterval = (interval: AuditLogHistogramInterval) => INTERVAL_LABELS[interval]()

export const formatCount = (value: number) => new Intl.NumberFormat(getLocale()).format(value)
