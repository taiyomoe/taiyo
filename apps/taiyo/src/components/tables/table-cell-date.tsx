import { DateTime } from "luxon"

type Props = {
  date: Date
}

export const TableCellDate = ({ date }: Props) =>
  DateTime.fromJSDate(date).toFormat("dd/MM/yyyy HH:mm")
