import { DashedGridPattern } from "~/components/ui/background-patterns/dashed-grid-pattern"
import { siteConfig } from "~/lib/config"
import { FeaturedMediasCategory } from "./_components/featured-medias/featured-medias-category"
import { LatestMediasCategory } from "./_components/latest-medias/latest-medias-category"
import { LatestReleasesCategory } from "./_components/latest-releases/latest-releases-category"
import { TrendingMediasCategory } from "./_components/trending-medias/trending-medias-category"

export default async function Page() {
  return (
    <main className="flex h-full flex-col gap-12">
      <FeaturedMediasCategory />
      <div className="flex flex-col gap-12 p-bodyPadding pt-0">
        <div className="-mt-12 absolute right-0 z-0 h-[350px] w-full 2xl:max-w-[1200px] lg:max-w-[900px] md:max-w-[600px] xl:max-w-[1100px]">
          <DashedGridPattern />
        </div>
        <div
          id={siteConfig.home.releasesLayoutContainerId}
          className="z-0 flex w-full flex-col gap-12 lg:flex-row data-[releases-layout=columns]:flex-col"
          data-releases-layout={siteConfig.home.releasesLayout}
        >
          <LatestReleasesCategory />
          <TrendingMediasCategory />
        </div>
        <LatestMediasCategory />
      </div>
    </main>
  )
}
