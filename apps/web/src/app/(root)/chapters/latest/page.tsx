import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import { Pagination } from "~/components/ui/pagination"
import { HydrateClient, prefetch, trpc } from "~/utils/trpc/server"
import { LatestPaginatedReleases } from "./_components/latest-paginated-releases"
import { LatestPaginatedReleasesSkeleton } from "./_components/latest-paginated-releases-skeleton"

type Props = {
  searchParams: Promise<{
    page?: string
    perPage?: string
  }>
}

export default async function Page({ searchParams }: Props) {
  const input = await searchParams
  const t = await getTranslations("global")

  prefetch(trpc.chapters.getPaginatedLatestReleases.queryOptions(input))

  return (
    <HydrateClient>
      <main className="mx-auto mt-(--navbar-height) w-full max-w-9xl space-y-6 p-4 md:p-8">
        <h1 className="font-bold text-4xl">{t("latestReleases")}</h1>
        <div className="space-y-8">
          <Suspense fallback={<LatestPaginatedReleasesSkeleton />}>
            <LatestPaginatedReleases />
          </Suspense>
          <Pagination />
        </div>
      </main>
    </HydrateClient>
  )
}
