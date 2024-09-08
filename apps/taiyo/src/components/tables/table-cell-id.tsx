import { CopyText } from "~/components/generics/texts/copy-text"

type Props = {
  id: string
}

export const TableCellId = ({ id }: Props) => (
  <div className="flex items-center gap-2">
    <span className="w-[295px]">{id}</span>
    <CopyText text={id} />
  </div>
)
