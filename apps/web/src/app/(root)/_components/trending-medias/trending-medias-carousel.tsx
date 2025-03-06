"use client"

import { ScrollShadow } from "@heroui/scroll-shadow"
import type { HomeLayout } from "@taiyomoe/db"
import type { LatestMedia } from "@taiyomoe/types"
import useEmblaCarousel from "embla-carousel-react"
import { useAtomValue } from "jotai"
import {} from "react"
import { TrendingMediasCard } from "~/app/(root)/_components/trending-medias/trending-medias-card"
import { releasesLayoutAtom } from "~/atoms/homeLayout.atoms"
import { CarouselButtons } from "~/components/generics/buttons/carousel-buttons"

type CarouselConfig = NonNullable<Parameters<typeof useEmblaCarousel>[0]>

type Props = {
  initialLayout: HomeLayout
  medias: LatestMedia[]
}

const HORIZONTAL_CONFIG: CarouselConfig = {
  startIndex: 0,
  dragFree: true,
  axis: "x",
}

const VERTICAL_CONFIG: CarouselConfig = {
  ...HORIZONTAL_CONFIG,
  breakpoints: {
    "(min-width: 1024px)": {
      startIndex: 0,
      dragFree: false,
      axis: "y",
    },
  },
}

export const TrendingMediasCarousel = ({ initialLayout, medias }: Props) => {
  const releasesLayout = useAtomValue(releasesLayoutAtom)
  const layout = releasesLayout ?? initialLayout
  const [horizontalEmblaRef, horizontalEmblaApi] =
    useEmblaCarousel(HORIZONTAL_CONFIG)
  const [verticalEmblaRef, verticalEmblaApi] = useEmblaCarousel(VERTICAL_CONFIG)

  return (
    <>
      <div
        className="relative data-[releases-layout=ROWS]:lg:hidden"
        data-releases-layout={layout}
      >
        <ScrollShadow
          ref={horizontalEmblaRef}
          orientation="horizontal"
          data-right-scroll={true}
          hideScrollBar
        >
          <div
            className="flex max-h-[400px] flex-row gap-6 data-[releases-layout=COLUMNS]:flex-row lg:max-h-[498px] lg:flex-col"
            data-releases-layout={layout}
          >
            {medias.map((media) => (
              <TrendingMediasCard
                key={media.id}
                initialLayout={initialLayout}
                media={media}
              />
            ))}
          </div>
        </ScrollShadow>
        <CarouselButtons
          className="-top-[52px] absolute right-0"
          onPrev={() => horizontalEmblaApi?.scrollPrev()}
          onNext={() => horizontalEmblaApi?.scrollNext()}
        />
      </div>
      <div
        className="relative hidden data-[releases-layout=ROWS]:lg:block"
        data-releases-layout={layout}
      >
        <div ref={verticalEmblaRef} className="flex overflow-hidden">
          <div className="flex h-[498px] flex-col gap-6">
            {medias.map((media) => (
              <TrendingMediasCard
                key={media.id}
                initialLayout={initialLayout}
                media={media}
              />
            ))}
          </div>
        </div>
        <CarouselButtons
          className="-top-[52px] absolute right-0"
          orientation="vertical"
          onPrev={() => verticalEmblaApi?.scrollPrev()}
          onNext={() => verticalEmblaApi?.scrollNext()}
        />
      </div>
    </>
  )
}
