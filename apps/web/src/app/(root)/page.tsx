import { Suspense } from "react"
import { HydrateClient, prefetch, trpc } from "~/utils/trpc/server"
import { FeaturedMediasCarousel } from "./_components/featured-medias/featured-medias-carousel"
import { FeaturedMediasSkeleton } from "./_components/featured-medias/featured-medias-skeleton"
import { LatestReleases } from "./_components/latest-releases/latest-releases"
import { TrendingMediasCarousel } from "./_components/trending-medias/trending-medias-carousel"

export default async function Page() {
  prefetch(trpc.medias.getFeaturedMedias.queryOptions())

  return (
    <HydrateClient>
      <main className="flex flex-col space-y-8">
        <Suspense fallback={<FeaturedMediasSkeleton />}>
          <FeaturedMediasCarousel />
        </Suspense>
        <div className="mx-auto min-h-[1400px] w-full max-w-9xl px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <LatestReleases />
            <TrendingMediasCarousel />
          </div>
        </div>
      </main>
    </HydrateClient>
  )
}
