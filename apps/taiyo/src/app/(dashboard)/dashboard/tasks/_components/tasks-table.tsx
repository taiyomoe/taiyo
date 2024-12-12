"use client"

import { TASKS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { AppRouter } from "@taiyomoe/trpc"
import { useQueryStates } from "nuqs"
import { useEffect } from "react"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useTasksListStore } from "~/stores/use-tasks-list-store"
import { api } from "~/trpc/react"
import { keepPreviousData } from "~/utils/keep-previous-data"
import { tasksSearchParams } from "./tasks-search-params"
import { columns } from "./tasks-table-columns"
import { TasksTableEmptyContent } from "./tasks-table-empty-content"
import { TasksTableFilters } from "./tasks-table-filters"

type Props = {
  initialData: Awaited<ReturnType<AppRouter["tasks"]["getList"]>>
}

export const TasksTable = ({ initialData }: Props) => {
  const [_, setSearchParams] = useQueryStates(tasksSearchParams)
  const { filter, sort, page, perPage, setSort, setPage, setPerPage } =
    useTasksListStore()
  const {
    data: { tasks: items, totalPages, totalCount } = initialData,
    isFetching,
  } = api.tasks.getList.useQuery(
    { filter, sort, page, perPage },
    { placeholderData: keepPreviousData(initialData) },
  )

  useEffect(() => {
    setSearchParams({ filter, page, perPage })
  }, [filter, page, perPage, setSearchParams])

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<TasksTableFilters />}
      emptyContent={<TasksTableEmptyContent />}
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
