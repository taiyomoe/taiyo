import { api } from "~/lib/trpc/server"

import { FeaturedMedias } from "./_components/FeaturedMedias"
import { LatestMedias } from "./_components/LatestMedias"
import { LatestReleases } from "./_components/LatestReleases"
import { TrendingMedias } from "./_components/TrendingMedias"

export default async function HomePage() {
  const { latestMedias, featuredMedias, latestReleases } =
    await api.medias.getHomePage.query()

  return (
    <main className="flex h-full flex-col p-bodyPadding">
      <div className="flex flex-col gap-12">
        <FeaturedMedias featuredMedias={featuredMedias} />
        <div className="flex w-full flex-col gap-12 md:flex-row">
          <LatestReleases latestReleases={latestReleases} />
          <TrendingMedias trendingMedias={latestMedias} />
        </div>
        <LatestMedias latestMedias={latestMedias} />
      </div>
    </main>
  )
}
