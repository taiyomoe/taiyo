import { DateTime } from "luxon"
import { DateRangeKey } from "~/lib/types"

const formatToInputValue = (input: Date) => {
  const dt = DateTime.fromJSDate(input)

  if (!dt.isValid) return ""

  return dt.toISODate()
}

const getDateFromRange = (type: "from" | "to", range: DateRangeKey) => {
  if (type === "from") {
    switch (range) {
      case "today":
        return DateTime.now().startOf("day").toMillis()
      case "yesterday":
        return DateTime.now().minus({ days: 1 }).startOf("day").toMillis()
      case "thisWeek":
        return DateTime.now().startOf("week").toMillis()
      case "lastWeek":
        return DateTime.now().minus({ weeks: 1 }).startOf("week").toMillis()
      case "thisMonth":
        return DateTime.now().startOf("month").toMillis()
      case "lastMonth":
        return DateTime.now().minus({ months: 1 }).startOf("month").toMillis()
      case "thisYear":
        return DateTime.now().startOf("year").toMillis()
      case "lastYear":
        return DateTime.now().minus({ years: 1 }).startOf("year").toMillis()
    }
  }

  switch (range) {
    case "today":
      return DateTime.now().endOf("day").toMillis()
    case "yesterday":
      return DateTime.now().minus({ days: 1 }).endOf("day").toMillis()
    case "thisWeek":
      return DateTime.now().endOf("week").toMillis()
    case "lastWeek":
      return DateTime.now().minus({ weeks: 1 }).endOf("week").toMillis()
    case "thisMonth":
      return DateTime.now().endOf("month").toMillis()
    case "lastMonth":
      return DateTime.now().minus({ months: 1 }).endOf("month").toMillis()
    case "thisYear":
      return DateTime.now().endOf("year").toMillis()
    case "lastYear":
      return DateTime.now().minus({ years: 1 }).endOf("year").toMillis()
  }
}

export const DateUtils = {
  formatToInputValue,
  getDateFromRange,
}
