"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "~/utils/trpc/react"
import { LatestPaginatedReleasesCard } from "./latest-paginated-releases-card"

export const LatestPaginatedReleases = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.chapters.getPaginatedLatestReleases.queryOptions({
      page: 1,
      perPage: 20,
    }),
  )

  console.log(data)

  return data.map((media) => (
    <LatestPaginatedReleasesCard key={media.id} media={media} />
  ))
}
