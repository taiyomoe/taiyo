import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import { HydrateClient, prefetch, trpc } from "~/utils/trpc/server"
import { FeaturedMediasCarousel } from "./_components/featured-medias/featured-medias-carousel"
import { FeaturedMediasSkeleton } from "./_components/featured-medias/featured-medias-skeleton"
import { LatestReleases } from "./_components/latest-releases/latest-releases"
import { LatestReleasesPageButton } from "./_components/latest-releases/latest-releases-page-button"
import { LatestReleasesSkeleton } from "./_components/latest-releases/latest-releases-skeleton"
import { TrendingMediasCarousel } from "./_components/trending-medias/trending-medias-carousel"

export default async function Page() {
  const t = await getTranslations("global")

  prefetch(trpc.medias.getFeatured.queryOptions())
  prefetch(trpc.chapters.getLatestReleases.queryOptions())

  return (
    <HydrateClient>
      <main className="flex flex-col space-y-8 pb-4 md:pb-8">
        <Suspense fallback={<FeaturedMediasSkeleton />}>
          <FeaturedMediasCarousel />
        </Suspense>
        <div className="mx-auto w-full max-w-9xl px-4 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-2xl">{t("latestReleases")}</h3>
                <LatestReleasesPageButton />
              </div>
              <div className="grid max-h-[584] grid-cols-1 gap-4 overflow-hidden md:max-h-[784] xl:grid-cols-2 2xl:grid-cols-3">
                <Suspense fallback={<LatestReleasesSkeleton />}>
                  <LatestReleases />
                </Suspense>
              </div>
            </div>
            <TrendingMediasCarousel />
          </div>
        </div>
      </main>
    </HydrateClient>
  )
}
