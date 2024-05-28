import { api } from "~/trpc/server"
import { FeaturedMedias } from "./_components/FeaturedMedias"
import { LatestReleases } from "./_components/LatestReleases"
import { TrendingMedias } from "./_components/TrendingMedias"
import { LatestMediasCategory } from "./_components/latest-medias/latest-medias-category"

export default async function HomePage() {
  const { latestMedias, featuredMedias, latestReleases } =
    await api.medias.getHomePage()

  return (
    <main className="flex h-full flex-col p-bodyPadding">
      <div className="flex flex-col gap-12">
        <FeaturedMedias featuredMedias={featuredMedias} />
        <div className="flex w-full flex-col gap-12 md:flex-row">
          <LatestReleases latestReleases={latestReleases} />
          <TrendingMedias trendingMedias={latestMedias} />
        </div>
        <LatestMediasCategory />
      </div>
    </main>
  )
}
