import type { ReactNode } from "react"

type Props = {
  colSpan: number
  children: ReactNode
}

export const TableBodyEmpty = ({ colSpan, children }: Props) => (
  <tbody className="rounded-lg">
    <tr>
      <td colSpan={colSpan} className="p-12 md:gap-12" width="100%">
        {children}
      </td>
    </tr>
  </tbody>
)
