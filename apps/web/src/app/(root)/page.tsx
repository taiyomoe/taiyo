import { Suspense } from "react"
import { HydrateClient, prefetch, trpc } from "~/utils/trpc/server"
import { FeaturedMediasCarousel } from "./_components/featured-medias/featured-medias-carousel"
import { FeaturedMediasSkeleton } from "./_components/featured-medias/featured-medias-skeleton"

export default async function Page() {
  prefetch(trpc.medias.getFeaturedMedias.queryOptions())

  return (
    <HydrateClient>
      <main className="flex flex-col space-y-8">
        <Suspense fallback={<FeaturedMediasSkeleton />}>
          <FeaturedMediasCarousel />
        </Suspense>
        <div className="min-h-[800px] overflow-x-hidden p-4">
          <h1 className="font-bold text-2xl">Lançamentos</h1>
        </div>
      </main>
    </HydrateClient>
  )
}
