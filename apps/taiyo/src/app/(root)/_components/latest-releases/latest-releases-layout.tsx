"use client"

import type { LatestRelease } from "@taiyomoe/types"
import { useAtom } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { LatestReleasesColumnLayout } from "~/app/(root)/_components/latest-releases/columns-layout/latest-releases-column-layout"
import { releasesLayoutAtom } from "~/atoms/homeLayout.atoms"
import { siteConfig } from "~/lib/config"
import { ReleaseCardRow } from "./rows-layout/release-card-row"

type Props = {
  releases: LatestRelease[]
}

export const LatestReleasesLayout = ({ releases }: Props) => {
  const [releasesLayout] = useAtom(releasesLayoutAtom)

  useHydrateAtoms([[releasesLayoutAtom, siteConfig.home.releasesLayout]])

  if (releasesLayout === "rows") {
    return (
      <div className="grid max-h-[752px] grid-cols-1 gap-4 overflow-hidden md:grid-cols-2 lg:md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
        {releases.map((r, i) => (
          <ReleaseCardRow key={r.id} release={r} index={i} />
        ))}
      </div>
    )
  }

  return <LatestReleasesColumnLayout />
}
