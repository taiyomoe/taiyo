import { MediaChapterService } from "@taiyomoe/services"
import { ReleaseCard } from "./release-card"

export const LatestReleasesCategory = async () => {
  const releases = await MediaChapterService.getLatestReleases()

  return (
    <div className="flex grow flex-col gap-4">
      <p className="font-semibold text-2xl">Lançamentos</p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {releases.map((release) => (
          <ReleaseCard key={release.id} release={release} />
        ))}
      </div>
    </div>
  )
}
