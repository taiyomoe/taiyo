import { getTasksListSchema } from "@taiyomoe/schemas"
import { ActivityIcon, CalculatorIcon, CircleDashedIcon } from "lucide-react"
import type { SearchParams } from "nuqs"
import { StatsCard } from "~/components/ui/stats-card"
import { TasksListStoreProvider } from "~/stores/use-tasks-list-store"
import { api } from "~/trpc/server"
import { sanitizeSearchParams } from "~/utils/sanitize-search-params"
import { tasksSearchParamsCache } from "./_components/tasks-search-params"
import { TasksTable } from "./_components/tasks-table"

type Props = {
  searchParams: SearchParams
}

export default async function Page(props: Props) {
  const searchParams = sanitizeSearchParams(
    props.searchParams,
    tasksSearchParamsCache,
    getTasksListSchema,
  )
  const initialData = await api.tasks.getList(searchParams)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Fila de espera</p>
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            label="Tarefas ativas"
            value={initialData.stats.active}
            icon={<ActivityIcon size={20} />}
          />
          <StatsCard
            label="Tarefas pendentes"
            value={initialData.stats.pending}
            icon={<CircleDashedIcon size={20} />}
          />
          <StatsCard
            label="Tarefas total"
            value={initialData.stats.totalCount}
            icon={<CalculatorIcon size={20} />}
          />
        </div>
        <TasksListStoreProvider value={{ input: searchParams }}>
          <TasksTable initialData={initialData} />
        </TasksListStoreProvider>
      </div>
    </div>
  )
}
