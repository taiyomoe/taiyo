import { DateTime } from "luxon"

type Props = {
  date: Date
}

export const TableCellDate = ({ date }: Props) =>
  DateTime.fromJSDate(date).setLocale("pt-br").toFormat("F")
