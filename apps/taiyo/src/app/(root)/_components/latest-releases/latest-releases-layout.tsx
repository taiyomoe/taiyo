"use client"

import type { HomeLayout } from "@taiyomoe/db"
import type { LatestRelease, LatestReleaseGrouped } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import { releasesLayoutAtom } from "~/atoms/homeLayout.atoms"
import { LatestReleasesColumnLayout } from "./columns-layout/latest-releases-column-layout"
import { LatestReleasesRowsLayout } from "./rows-layout/latest-releases-rows-layout"

type Props = {
  initialLayout: HomeLayout
  initialData: LatestRelease[] | LatestReleaseGrouped[]
}

export const LatestReleasesLayout = ({ initialLayout, initialData }: Props) => {
  const layout = useAtomValue(releasesLayoutAtom)

  if (layout === "ROWS") {
    return (
      <LatestReleasesRowsLayout
        initialData={
          initialLayout === "ROWS" ? (initialData as LatestRelease[]) : null
        }
      />
    )
  }

  return (
    <LatestReleasesColumnLayout
      initialData={
        initialLayout === "COLUMNS"
          ? (initialData as LatestReleaseGrouped[])
          : null
      }
    />
  )
}
