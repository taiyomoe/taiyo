import { ChaptersTable } from "~/components/ui/chapters/list/chapters-table"
import { api } from "~/trpc/server"

export default async function Page() {
  const initialData = await api.chapters.getList({})

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Capítulos</p>
      <ChaptersTable initialData={initialData} />
    </div>
  )
}
