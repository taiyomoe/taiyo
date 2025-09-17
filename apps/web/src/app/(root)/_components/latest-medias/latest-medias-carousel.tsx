"use client"

import { Slider } from "@taiyomoe/ui/components/slider"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { EmblaCarouselType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
import { useSettings } from "~/stores/auth.store"
import { useTRPC } from "~/utils/trpc/react"
import { LatestMediasCard } from "./latest-medias-card"

export const LatestMediasCarousel = () => {
  const settings = useSettings()
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.medias.getLatest.queryOptions({
      contentRating: settings.contentRating,
    }),
  )
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true })
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
    setScrollProgress(progress * 100)
  }, [])

  const handleScrollProgress = useCallback(
    (v: number | readonly number[]) => {
      if (!emblaApi) return

      const slideCount = emblaApi.slideNodes().length
      const slideIndex =
        Math.floor((typeof v === "number" ? v : v[0]!) / 100) * (slideCount - 1)

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
        className="absolute top-2.5 right-0 z-30 w-[200] [&_[data-slider=thumb]]:hidden [&_[data-slider=track]]:h-3"
        value={scrollProgress}
        onValueChange={handleScrollProgress}
        defaultValue={[0]}
      />
    </div>
  )
}
