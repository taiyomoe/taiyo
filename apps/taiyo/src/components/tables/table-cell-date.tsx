import { DateTime } from "luxon"

type Props = {
  date: Date | null
}

export const TableCellDate = ({ date }: Props) => {
  if (!date) return null

  return DateTime.fromJSDate(date).setLocale("pt-br").toFormat("F")
}
