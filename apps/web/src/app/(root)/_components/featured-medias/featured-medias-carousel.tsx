"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "~/utils/trpc/react"

export const FeaturedMediasCarousel = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.medias.getFeaturedMedias.queryOptions(),
  )

  return (
    <div>
      <p>{data.title}</p>
    </div>
  )
}
