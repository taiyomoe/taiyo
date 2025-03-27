"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "react-aria-components"
import { useTRPC } from "~/utils/trpc/react"
import { FeaturedMediasCard } from "./featured-medias-card"

export const FeaturedMediasCarousel = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.medias.getFeaturedMedias.queryOptions(),
  )
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 10000 }),
  ])

  return (
    <div
      ref={emblaRef}
      className="relative min-h-(--featured-media-card-height) overflow-hidden"
    >
      <div className="flex">
        {data.map((media) => (
          <FeaturedMediasCard key={media.id} media={media} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-4 mx-auto hidden w-full w-full max-w-9xl justify-end px-4 md:flex">
        <div>
          <Button
            className="rounded-full pressed:bg-primary/20 p-2 outline-none outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default disabled:opacity-50"
            onPress={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeftIcon className="size-6 text-brand" />
          </Button>
          <Button
            className="rounded-full pressed:bg-primary/20 p-2 outline-none outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default disabled:opacity-50"
            onPress={() => emblaApi?.scrollNext()}
          >
            <ChevronRightIcon className="size-6 text-brand" />
          </Button>
        </div>
      </div>
    </div>
  )
}
