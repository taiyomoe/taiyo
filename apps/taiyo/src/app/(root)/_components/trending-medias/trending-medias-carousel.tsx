"use client"

import { ScrollShadow } from "@nextui-org/react"
import type { LatestMedia } from "@taiyomoe/types"
import { MediaCoverUtils } from "@taiyomoe/utils"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"

type Props = {
  medias: LatestMedia[]
}

export const TrendingMediasCarousel = ({ medias }: Props) => {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    axis: "x",
    loop: false,
    breakpoints: {
      // MD and up
      "(min-width: 1024px)": {
        dragFree: false,
        axis: "y",
        loop: true,
      },
    },
  })

  return (
    <ScrollShadow
      className="scrollbar-none overflow-hidden"
      orientation="horizontal"
      ref={emblaRef}
    >
      <div className="flex max-h-[400px] flex-row lg:max-h-[498px] lg:flex-col">
        {medias.map((media) => (
          <Link
            key={media.id}
            href={`/media/${media.id}`}
            className="relative mr-6 max-h-[400px] min-h-[400px] last:mr-0 lg:mr-0 lg:mb-6 lg:max-h-[498px] lg:min-h-[498px] hover:cursor-pointer"
          >
            <MediaImage
              src={MediaCoverUtils.getUrl(media)}
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
