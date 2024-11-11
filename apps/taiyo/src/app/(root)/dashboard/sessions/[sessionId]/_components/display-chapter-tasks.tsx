import type { Task } from "@taiyomoe/db"
import { TaskUtils } from "@taiyomoe/utils"
import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/generics/data-table/table"
import { TableCellDate } from "~/components/tables/table-cell-date"
import { TableCellId } from "~/components/tables/table-cell-id"
import { TableCellJson } from "~/components/tables/table-cell-json"
import { TableCellStatus } from "~/components/tables/table-cell-status"

type Props = {
  rawTasks: Task[]
}

export const DisplayChapterTasks = ({ rawTasks }: Props) => {
  const tasks = useMemo(
    () =>
      rawTasks
        .filter((t) => t.type === "IMPORT_CHAPTER")
        .map((t) => ({
          ...t,
          payload: TaskUtils.getPayload(t, "IMPORT_CHAPTER"),
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    [rawTasks],
  )

  return (
    <div className="space-y-4">
      <p className="font-medium text-lg">Capítulos</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Payload</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <TableCellId id={task.id} />
              </TableCell>
              <TableCell>
                <TableCellDate date={task.createdAt} />
              </TableCell>
              <TableCell>
                <TableCellStatus status={task.status} />
              </TableCell>
              <TableCell>
                <p>{task.payload.number}</p>
              </TableCell>
              <TableCell>
                <p>{task.payload.volume}</p>
              </TableCell>
              <TableCell>
                <TableCellJson json={task.payload} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
