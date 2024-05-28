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
      "(min-width: 768px)": {
        dragFree: false,
        axis: "y",
        loop: true,
      },
    },
  })

  return (
    <ScrollShadow
      className="scrollbar-none"
      orientation="horizontal"
      ref={emblaRef}
    >
      <div className="flex max-h-[400px] flex-row md:max-h-[498px] md:flex-col">
        {medias.map((media) => (
          <Link
            key={media.id}
            href={`/media/${media.id}`}
            className="relative mr-6 max-h-[400px] min-h-[400px] last:mr-0 md:mr-0 md:mb-6 md:max-h-[498px] md:min-h-[498px] hover:cursor-pointer"
          >
            <MediaImage
              src={MediaCoverUtils.getUrl(media)}
              classNames={{
                height: "h-[400px] md:h-[498px]",
                width: "w-[280px] md:w-[350px]",
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
