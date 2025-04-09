"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { EmblaCarouselType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
import { Slider } from "~/components/ui/slider"
import { useTRPC } from "~/utils/trpc/react"
import { LatestMediasCard } from "./latest-medias-card"

export const LatestMediasCarousel = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.medias.getLatest.queryOptions())
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true })
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
    setScrollProgress(progress * 100)
  }, [])

  const handleScrollProgress = useCallback(
    (v: number[]) => {
      if (!emblaApi) return

      const slideCount = emblaApi.slideNodes().length
      const slideIndex = Math.floor((v[0]! / 100) * (slideCount - 1))

      emblaApi.scrollTo(slideIndex)
    },
    [emblaApi],
  )

  useEffect(() => {
    if (!emblaApi) return

    handleScroll(emblaApi)
    emblaApi
      .on("reInit", handleScroll)
      .on("scroll", handleScroll)
      .on("slideFocus", handleScroll)
  }, [emblaApi, handleScroll])

  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className="flex gap-4">
        {data.map((m) => (
          <LatestMediasCard key={m.id} media={m} />
        ))}
      </div>
      <Slider
        className="absolute top-2.5 right-0 z-30 w-[200] [&_[data-slider=thumb]]:hidden [&_[data-slider=track]]:h-3 [&_[data-slider=track]]:border [&_[data-slider=track]]:border-subtle"
        value={[scrollProgress]}
        onValueChange={handleScrollProgress}
        defaultValue={[0]}
      />
    </div>
  )
}
