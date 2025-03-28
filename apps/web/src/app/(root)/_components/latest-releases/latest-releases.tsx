"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "~/utils/trpc/react"
import { LatestReleasesCard } from "./latest-releases-card"

export const LatestReleases = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.medias.getLatestReleases.queryOptions(),
  )

  return (
    <div className="w-full space-y-4">
      <h3 className="font-bold text-2xl">Lançamentos</h3>
      <div className="grid max-h-[572] grid-cols-1 gap-4 overflow-hidden md:max-h-[768] xl:grid-cols-2 2xl:grid-cols-3">
        {data.map((chapter) => (
          <LatestReleasesCard key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </div>
  )
}
