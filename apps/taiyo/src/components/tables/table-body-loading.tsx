import { Skeleton } from "@nextui-org/skeleton"

type Props = {
  perPage: number
  colSpan: number
}

export const TableBodyLoading = ({ perPage, colSpan }: Props) => (
  <tbody>
    {Array.from({ length: perPage }).map((_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: I don't have anything else to use
      <tr key={i} className="group">
        <td className="px-0 py-0.5" colSpan={colSpan}>
          <Skeleton className="h-9 w-full group-first:rounded-t-lg group-last:rounded-b-lg " />
        </td>
      </tr>
    ))}
  </tbody>
)
