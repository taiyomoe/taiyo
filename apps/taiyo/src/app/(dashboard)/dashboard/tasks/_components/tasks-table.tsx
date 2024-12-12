"use client"

import { TASKS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { AppRouter } from "@taiyomoe/trpc"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useTasksListStore } from "~/stores/useTasksListStore"
import { api } from "~/trpc/react"
import { columns } from "./tasks-table-columns"
import { TasksTableFilters } from "./tasks-table-filters"

type Props = {
  initialData: Awaited<ReturnType<AppRouter["tasks"]["getList"]>>
}

export const TasksTable = ({ initialData }: Props) => {
  const { filter, sort, page, perPage, setSort, setPage, setPerPage } =
    useTasksListStore()
  const {
    data: { tasks: items, totalPages, totalCount },
    isFetching,
  } = api.tasks.getList.useQuery(
    { filter, sort, page, perPage },
    { initialData, refetchOnMount: false },
  )

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<TasksTableFilters />}
      emptyContent={<p>Nenhuma tarefa encontrada</p>}
      initialVisibility={{
        id: false,
        payload: false,
      }}
      page={page}
      perPage={perPage}
      perPageChoices={TASKS_LIST_PER_PAGE_CHOICES}
      totalPages={totalPages}
      totalCount={totalCount}
      isLoading={isFetching}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      onSort={setSort}
    />
  )
}
