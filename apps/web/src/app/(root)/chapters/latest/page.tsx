import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import { HydrateClient, prefetch, trpc } from "~/utils/trpc/server"
import { LatestPaginatedReleases } from "./_components/latest-paginated-releases"
import { LatestPaginatedReleasesSkeleton } from "./_components/latest-paginated-releases-skeleton"

export default async function Page() {
  const t = await getTranslations("global")

  prefetch(
    trpc.chapters.getPaginatedLatestReleases.queryOptions({
      page: 1,
      perPage: 20,
    }),
  )

  return (
    <HydrateClient>
      <main className="mx-auto mt-(--navbar-height) w-full max-w-9xl space-y-6 p-4 md:p-8">
        <h1 className="font-bold text-4xl">{t("latestReleases")}</h1>
        <div className="space-y-8">
          <Suspense fallback={<LatestPaginatedReleasesSkeleton />}>
            <LatestPaginatedReleases />
          </Suspense>
        </div>
      </main>
    </HydrateClient>
  )
}
