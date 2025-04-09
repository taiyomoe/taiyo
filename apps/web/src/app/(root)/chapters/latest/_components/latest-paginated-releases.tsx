"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { parseAsInteger, useQueryStates } from "nuqs"
import { useTRPC } from "~/utils/trpc/react"
import { LatestPaginatedReleasesCard } from "./latest-paginated-releases-card"
import { LatestPaginatedReleasesSkeleton } from "./latest-paginated-releases-skeleton"

export const LatestPaginatedReleases = () => {
  const [input] = useQueryStates({
    page: parseAsInteger,
    perPage: parseAsInteger,
  })
  const trpc = useTRPC()
  const { data, isLoading } = useSuspenseQuery(
    trpc.chapters.getPaginatedLatestReleases.queryOptions(input),
  )

  if (isLoading) {
    return <LatestPaginatedReleasesSkeleton />
  }

  return data.map((media) => (
    <LatestPaginatedReleasesCard key={media.id} media={media} />
  ))
}
