"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import useEmblaCarousel from "embla-carousel-react"
import { useTRPC } from "~/utils/trpc/react"
import { FeaturedMediasCard } from "./featured-medias-card"

export const FeaturedMediasCarousel = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.medias.getFeaturedMedias.queryOptions(),
  )
  const [emblaRef] = useEmblaCarousel({})

  console.log(data)

  return (
    <div
      ref={emblaRef}
      className="relative min-h-[340px] overflow-hidden md:min-h-[400px] xl:min-h-[440px]"
    >
      <div className="flex">
        {data.map((media) => (
          <FeaturedMediasCard key={media.id} media={media} />
        ))}
      </div>
    </div>
  )
}
