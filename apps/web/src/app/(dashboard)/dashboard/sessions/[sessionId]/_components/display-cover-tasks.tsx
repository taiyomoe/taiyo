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
import { TableCellLanguage } from "~/components/tables/table-cell-language"
import { TableCellTaskStatus } from "~/components/tables/table-cell-task-status"

type Props = {
  rawTasks: Task[]
}

export const DisplayCoverTasks = ({ rawTasks }: Props) => {
  const tasks = useMemo(
    () =>
      rawTasks
        .filter((t) => t.type === "IMPORT_COVER")
        .map((t) => ({
          ...t,
          payload: TaskUtils.getPayload(t, "IMPORT_COVER"),
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    [rawTasks],
  )

  return (
    <div className="space-y-4">
      <p className="font-medium text-lg">Covers</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Linguagem</TableHead>
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
                <TableCellTaskStatus status={task.status} />
              </TableCell>
              <TableCell>
                <p>{task.payload.volume}</p>
              </TableCell>
              <TableCell>
                <TableCellLanguage language={task.payload.language} />
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
