import type { LatestRelease } from "~/lib/types"

import { ReleaseCard } from "./ReleaseCard"

type Props = {
  latestReleases: LatestRelease[]
}

export const LatestReleases = ({ latestReleases }: Props) => (
  <div className="flex grow flex-col gap-6">
    <p className="text-2xl font-medium">Lançamentos</p>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {latestReleases.map((release) => (
        <ReleaseCard key={release.id} release={release} />
      ))}
    </div>
  </div>
)
