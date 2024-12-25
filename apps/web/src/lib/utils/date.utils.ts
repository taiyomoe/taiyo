import type { DateValue } from "@nextui-org/react"
import { DateTime } from "luxon"

const formatToInputValue = (input: Date) => {
  const dt = DateTime.fromJSDate(input)

  if (!dt.isValid) return ""

  return dt.toISODate()
}

const isLessThanDays = (date: Date, number: number) => {
  const dt = DateTime.fromJSDate(date)
  const now = DateTime.now()

  return now.diff(dt, "days").days < number
}

const getAge = (date: Date) => {
  const today = new Date()
  let years = today.getFullYear() - date.getFullYear()

  if (
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())
  ) {
    years--
  }

  return years
}

const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

const getFromDateValue = (input: DateValue) =>
  DateTime.fromJSDate(input.toDate(getTimezone()))

export const DateUtils = {
  formatToInputValue,
  isLessThanDays,
  getAge,
  getTimezone,
  getFromDateValue,
}
