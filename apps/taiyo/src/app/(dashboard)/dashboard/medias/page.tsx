import { MediasTable } from "~/components/ui/medias-list/medias-table"
import { api } from "~/trpc/server"

export default async function Page() {
  const initialData = await api.medias.getList({ filter: "deletedAt is null" })

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Obras</p>
      <MediasTable initialData={initialData} />
    </div>
  )
}
