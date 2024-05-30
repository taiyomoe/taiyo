import { FeaturedMediasCategory } from "./_components/featured-medias/featured-medias-category"
import { LatestMediasCategory } from "./_components/latest-medias/latest-medias-category"
import { LatestReleasesCategory } from "./_components/latest-releases/latest-releases-category"
import { TrendingMediasCategory } from "./_components/trending-medias/trending-medias-category"

export default async function HomePage() {
  return (
    <main className="flex h-full flex-col gap-12">
      <FeaturedMediasCategory />
      <div className="flex flex-col gap-12 p-bodyPadding pt-0">
        <div className="flex w-full flex-col gap-12 md:flex-row">
          <LatestReleasesCategory />
          <TrendingMediasCategory />
        </div>
        <LatestMediasCategory />
      </div>
    </main>
  )
}
