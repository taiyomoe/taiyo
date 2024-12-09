import { ActivityIcon, CalculatorIcon, CircleDotIcon } from "lucide-react"
import { api } from "~/trpc/server"
import { TaskOverviewCard } from "./_components/task-overview-card"

export default async function Page() {
  const { active, pending, total } = await api.tasks.getAll()

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Fila de espera</p>
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <TaskOverviewCard
            label="Tarefas ativas"
            value={active}
            icon={<ActivityIcon size={20} />}
          />
          <TaskOverviewCard
            label="Tarefas pendentes"
            value={pending}
            icon={<CircleDotIcon size={20} />}
          />
          <TaskOverviewCard
            label="Tarefas total"
            value={total}
            icon={<CalculatorIcon size={20} />}
          />
        </div>
      </div>
    </div>
  )
}
