const TYPED_TIME = /^(\d{1,2})(?:[:.h]?(\d{2}))?\s*(?:([ap])\.?(?:m\.?)?)?$/

export const parseTime = (text: string) => {
  const match = TYPED_TIME.exec(text.trim().toLowerCase())

  if (match === null) {
    return null
  }

  const [, hourText = "", minuteText = "0", period] = match
  const minute = Number(minuteText)
  let hour = Number(hourText)

  if (period !== undefined) {
    if (hour < 1 || hour > 12) {
      return null
    }

    hour = (hour % 12) + (period === "p" ? 12 : 0)
  }

  if (hour > 23 || minute > 59) {
    return null
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}
