type Props = {
  colSpan: number
}

export const TableBodyEmpty = ({ colSpan }: Props) => {
  return (
    <tbody className="rounded-lg">
      <tr>
        <td colSpan={colSpan} className="h-28 [&_div]:justify-center">
          No results.
        </td>
      </tr>
    </tbody>
  )
}
