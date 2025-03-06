import { getMediasListSchema } from "@taiyomoe/schemas"
import { CalculatorIcon } from "lucide-react"
import type { SearchParams } from "nuqs"
import { StatsCard } from "~/components/ui/stats-card"
import { MediasListStoreProvider } from "~/stores/use-medias-list-store"
import { api } from "~/trpc/server"
import { sanitizeSearchParams } from "~/utils/sanitize-search-params"
import { mediasSearchParamsCache } from "./_components/medias-search-params"
import { MediasTable } from "./_components/medias-table"

type Props = {
  searchParams: SearchParams
}

export default async function Page(props: Props) {
  const searchParams = sanitizeSearchParams(
    props.searchParams,
    mediasSearchParamsCache,
    getMediasListSchema,
  )
  const initialData = await api.medias.getList(searchParams)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Obras</p>
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            label="Obras ativas total"
            value={initialData.stats.totalCount}
            icon={<CalculatorIcon size={20} />}
          />
        </div>
        <MediasListStoreProvider value={{ input: searchParams }}>
          <MediasTable initialData={initialData} />
        </MediasListStoreProvider>
      </div>
    </div>
  )
}
