type Props = {
  value: boolean
}

export const TableCellBoolean = ({ value }: Props) => (value ? "Sim" : "Não")
