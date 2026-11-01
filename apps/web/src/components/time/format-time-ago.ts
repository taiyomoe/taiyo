import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const UNITS = [
  { unit: "year", seconds: 31_536_000 },
  { unit: "month", seconds: 2_592_000 },
  { unit: "week", seconds: 604_800 },
  { unit: "day", seconds: 86_400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
] as const

export const formatTimeAgo = (
  date: Date,
  now: number,
  style: Intl.RelativeTimeFormatStyle,
  future = false,
) => {
  const direction = future ? 1 : -1
  const elapsed = Math.max(0, (direction * (date.getTime() - now)) / 1000)
  const match = UNITS.find(({ seconds }) => elapsed >= seconds)

  if (match === undefined) {
    return future ? m.time_any_moment() : m.time_just_now()
  }

  return new Intl.RelativeTimeFormat(getLocale(), { style }).format(
    direction * Math.floor(elapsed / match.seconds),
    match.unit,
  )
}
