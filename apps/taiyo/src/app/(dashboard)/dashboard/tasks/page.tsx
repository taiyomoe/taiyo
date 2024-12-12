import { ActivityIcon, CalculatorIcon, CircleDashedIcon } from "lucide-react"
import { TasksTable } from "~/app/(dashboard)/dashboard/tasks/_components/tasks-table"
import { api } from "~/trpc/server"
import { TaskOverviewCard } from "./_components/task-overview-card"

export default async function Page() {
  const initialData = await api.tasks.getList({
    page: 1,
    perPage: 50,
  })

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Fila de espera</p>
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <TaskOverviewCard
            label="Tarefas ativas"
            value={initialData.stats.active}
            icon={<ActivityIcon size={20} />}
          />
          <TaskOverviewCard
            label="Tarefas pendentes"
            value={initialData.stats.pending}
            icon={<CircleDashedIcon size={20} />}
          />
          <TaskOverviewCard
            label="Tarefas total"
            value={initialData.stats.totalCount}
            icon={<CalculatorIcon size={20} />}
          />
        </div>
        <TasksTable initialData={initialData} />
      </div>
    </div>
  )
}
