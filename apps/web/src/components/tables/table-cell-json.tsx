import {} from "@nextui-org/react"
import { CopyText } from "~/components/generics/texts/copy-text"
import { Tooltip } from "~/components/generics/tooltip"

type Props = {
  json: Record<string, unknown>
}

export const TableCellJson = ({ json }: Props) => (
  <div className="flex items-center gap-2">
    <Tooltip content={JSON.stringify(json)} showArrow>
      <p className="max-w-32 truncate break-all">{JSON.stringify(json)}</p>
    </Tooltip>
    <CopyText text={JSON.stringify(json)} />
  </div>
)
