"use client"

import { Spinner } from "@heroui/spinner"
import type { LatestRelease } from "@taiyomoe/types"
import { api } from "~/trpc/react"
import { ReleaseCardRow } from "./release-card-row"

type Props = {
  initialData: LatestRelease[] | null
}

export const LatestReleasesRowsLayout = ({ initialData }: Props) => {
  const { data, isLoading } = api.chapters.getLatest.useQuery(
    undefined,
    initialData ? { initialData } : undefined,
  )

  if (!data || isLoading) {
    return <Spinner size="lg" />
  }

  return (
    <div className="grid max-h-[752px] grid-cols-1 gap-4 overflow-hidden md:grid-cols-2 lg:md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
      {data.map((r, i) => (
        <ReleaseCardRow key={r.id} release={r} index={i} />
      ))}
    </div>
  )
}
