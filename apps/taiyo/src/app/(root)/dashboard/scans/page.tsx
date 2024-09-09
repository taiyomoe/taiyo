import { ScansTable } from "~/components/ui/scans/scans-table"
import { api } from "~/trpc/server"

export default async function Page() {
  const initialData = await api.scans.getList({ filter: "deletedAt is null" })

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Scans</p>
      <ScansTable initialData={initialData} />
    </div>
  )
}
