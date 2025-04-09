"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "~/utils/trpc/react"
import { LatestReleasesCard } from "./latest-releases-card"

export const LatestReleases = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.chapters.getLatestReleases.queryOptions(),
  )

  return data.map((chapter) => (
    <LatestReleasesCard key={chapter.id} chapter={chapter} />
  ))
}
