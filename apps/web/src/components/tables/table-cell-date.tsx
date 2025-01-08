import { DateTime } from "luxon"

type Props = {
  date: Date | null
  format?: string
}

export const TableCellDate = ({ date, format = "F" }: Props) => {
  if (!date) return null

  return DateTime.fromJSDate(date).setLocale("pt-br").toFormat(format)
}
