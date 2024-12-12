import { getTasksListSchema } from "@taiyomoe/schemas"
import { ActivityIcon, CalculatorIcon, CircleDashedIcon } from "lucide-react"
import type { SearchParams } from "nuqs"
import { TasksListStoreProvider } from "~/stores/use-tasks-list-store"
import { api } from "~/trpc/server"
import { TaskStatCard } from "./_components/task-stat-card"
import { tasksSearchParamsCache } from "./_components/tasks-search-params"
import { TasksTable } from "./_components/tasks-table"

type Props = {
  searchParams: SearchParams
}
export default async function Page(props: Props) {
  const parsedSearchParams = tasksSearchParamsCache.parse(props.searchParams)
  const searchParams = getTasksListSchema.parse(parsedSearchParams)
  const initialData = await api.tasks.getList(searchParams)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Fila de espera</p>
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <TaskStatCard
            label="Tarefas ativas"
            value={initialData.stats.active}
            icon={<ActivityIcon size={20} />}
          />
          <TaskStatCard
            label="Tarefas pendentes"
            value={initialData.stats.pending}
            icon={<CircleDashedIcon size={20} />}
          />
          <TaskStatCard
            label="Tarefas total"
            value={initialData.stats.totalCount}
            icon={<CalculatorIcon size={20} />}
          />
        </div>
        <TasksListStoreProvider value={searchParams}>
          <TasksTable initialData={initialData} />
        </TasksListStoreProvider>
      </div>
    </div>
  )
}
