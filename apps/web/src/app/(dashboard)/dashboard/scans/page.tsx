import { getScansListSchema } from "@taiyomoe/schemas"
import { CalculatorIcon } from "lucide-react"
import type { SearchParams } from "nuqs"
import { StatsCard } from "~/components/ui/stats-card"
import { ScansListStoreProvider } from "~/stores/use-scans-list-store"
import { api } from "~/trpc/server"
import { sanitizeSearchParams } from "~/utils/sanitize-search-params"
import { scansSearchParamsCache } from "./_components/scans-search-params"
import { ScansTable } from "./_components/scans-table"

type Props = {
  searchParams: SearchParams
}

export default async function Page(props: Props) {
  const searchParams = sanitizeSearchParams(
    props.searchParams,
    scansSearchParamsCache,
    getScansListSchema,
  )
  const initialData = await api.scans.getList(searchParams)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Fila de espera</p>
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            label="Scans ativas total"
            value={initialData.stats.totalCount}
            icon={<CalculatorIcon size={20} />}
          />
        </div>
        <ScansListStoreProvider value={{ input: searchParams }}>
          <ScansTable initialData={initialData} />
        </ScansListStoreProvider>
      </div>
    </div>
  )
}
