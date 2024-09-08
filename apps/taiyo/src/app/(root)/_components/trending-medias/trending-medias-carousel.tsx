"use client"

import { ScrollShadow } from "@nextui-org/scroll-shadow"
import type { LatestMedia } from "@taiyomoe/types"
import { CoverUtils } from "@taiyomoe/utils"
import useEmblaCarousel from "embla-carousel-react"
import { useAtomValue } from "jotai"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { releasesLayoutAtom } from "~/atoms/homeLayout.atoms"
import { MediaImage } from "~/components/images/MediaImage"
import { cn } from "~/lib/utils/cn"

type Props = {
  medias: LatestMedia[]
}

const CAROUSEL_BREAKPOINTS: NonNullable<
  Parameters<typeof useEmblaCarousel>[0]
>["breakpoints"] = {
  "(min-width: 1024px)": {
    dragFree: false,
    axis: "y",
    loop: true,
  },
}

export const TrendingMediasCarousel = ({ medias }: Props) => {
  const releasesLayout = useAtomValue(releasesLayoutAtom)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    axis: "x",
    loop: false,
    breakpoints: CAROUSEL_BREAKPOINTS,
  })
  const previousReleasesLayout = useRef(releasesLayout)

  useEffect(() => {
    if (!emblaApi) return

    if (previousReleasesLayout.current !== releasesLayout) {
      emblaApi.reInit({
        breakpoints:
          releasesLayout === "rows" ? CAROUSEL_BREAKPOINTS : undefined,
      })

      previousReleasesLayout.current = releasesLayout
    }
  }, [emblaApi, releasesLayout])

  return (
    <ScrollShadow
      ref={emblaRef}
      orientation="horizontal"
      data-right-scroll={true}
      hideScrollBar
    >
      <div
        className="flex max-h-[400px] flex-row data-[releases-layout=columns]:flex-row lg:max-h-[498px] lg:flex-col"
        data-releases-layout={releasesLayout}
      >
        {medias.map((media) => (
          <Link
            key={media.id}
            href={`/media/${media.id}`}
            className={cn(
              "relative mr-6 max-h-[400px] min-h-[400px] last:mr-0 hover:cursor-pointer lg:max-h-[498px] lg:min-h-[498px]",
              { "lg:mr-0 lg:mb-6": releasesLayout === "rows" },
            )}
          >
            <MediaImage
              src={CoverUtils.getUrl(media)}
              classNames={{
                height: "h-[400px] lg:h-[498px]",
                width: "w-[280px] lg:w-[350px]",
              }}
              maxHeight={498}
              maxWidth={350}
              alt="media's cover"
              isZoomed
            />
          </Link>
        ))}
      </div>
    </ScrollShadow>
  )
}
