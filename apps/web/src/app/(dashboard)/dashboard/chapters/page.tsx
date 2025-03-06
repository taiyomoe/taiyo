import { getChaptersListSchema } from "@taiyomoe/schemas"
import { CalculatorIcon } from "lucide-react"
import type { SearchParams } from "nuqs"
import { StatsCard } from "~/components/ui/stats-card"
import { ChaptersListStoreProvider } from "~/stores/use-chapters-list-store"
import { api } from "~/trpc/server"
import { sanitizeSearchParams } from "~/utils/sanitize-search-params"
import { chaptersSearchParamsCache } from "./_components/chapters-search-params"
import { ChaptersTable } from "./_components/chapters-table"

type Props = {
  searchParams: SearchParams
}

export default async function Page(props: Props) {
  const searchParams = sanitizeSearchParams(
    props.searchParams,
    chaptersSearchParamsCache,
    getChaptersListSchema,
  )
  const initialData = await api.chapters.getList(searchParams)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Capítulos</p>
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            label="Capítulos ativos total"
            value={initialData.stats.totalCount}
            icon={<CalculatorIcon size={20} />}
          />
        </div>
        <ChaptersListStoreProvider value={{ input: searchParams }}>
          <ChaptersTable initialData={initialData} />
        </ChaptersListStoreProvider>
      </div>
    </div>
  )
}
