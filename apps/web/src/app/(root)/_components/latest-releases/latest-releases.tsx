"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useSettings } from "~/stores/auth.store"
import { useTRPC } from "~/utils/trpc/react"
import { LatestReleasesCard } from "./latest-releases-card"

export const LatestReleases = () => {
  const settings = useSettings()
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.chapters.getLatestReleases.queryOptions({
      contentRating: settings.contentRating,
    }),
  )

  return data.map((chapter) => (
    <LatestReleasesCard key={chapter.id} chapter={chapter} />
  ))
}
