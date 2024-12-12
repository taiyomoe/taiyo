"use client"

import { TASKS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { AppRouter } from "@taiyomoe/trpc"
import { useEffect } from "react"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useTasksListStore } from "~/stores/use-tasks-list-store"
import { api } from "~/trpc/react"
import { keepPreviousData } from "~/utils/keep-previous-data"
import { columns } from "./tasks-table-columns"
import { TasksTableFilters } from "./tasks-table-filters"

type Props = {
  initialData: Awaited<ReturnType<AppRouter["tasks"]["getList"]>>
}

export const TasksTable = ({ initialData }: Props) => {
  const { filter, sort, page, perPage, setSort, setPage, setPerPage } =
    useTasksListStore()
  const {
    data: { tasks: items, totalPages, totalCount } = initialData,
    isFetching,
  } = api.tasks.getList.useQuery(
    { filter, sort, page, perPage },
    { placeholderData: keepPreviousData(initialData) },
  )
  const utils = api.useUtils()

  useEffect(() => {
    utils.tasks.getList.invalidate({ filter, sort, page, perPage })
  }, [filter, sort, page, perPage, utils.tasks.getList.invalidate])

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
