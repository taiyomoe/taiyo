import { Tooltip } from "~/components/generics/tooltip"

type Props = {
  text: string | null
}

export const TableCellLong = ({ text }: Props) => {
  if (!text) return null

  return (
    <Tooltip className="max-w-96" content={text}>
      <p className="max-w-64 truncate break-all">{text}</p>
    </Tooltip>
  )
}
