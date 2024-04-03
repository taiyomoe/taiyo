"use client"

import type { LatestMedia } from "@taiyomoe/types"
import { MediaCoverUtils } from "@taiyomoe/utils"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { useDevice } from "~/hooks/useDevice"
import { cn } from "~/lib/utils/cn"

type Props = {
  medias: LatestMedia[]
}

export const SwipeableTrendingMedias = ({ medias }: Props) => {
  const device = useDevice()
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
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex max-h-[400px] flex-row md:max-h-[498px] md:flex-col">
        {medias.map((media, i) => (
          <Link
            key={media.id}
            href={`/media/${media.id}`}
            className={cn(
              "relative max-h-[400px] min-h-[400px] md:max-h-[498px] md:min-h-[498px] hover:cursor-pointer",
              {
                "mr-6": !device?.isAboveTablet && i !== medias.length - 1,
                "mb-6": device?.isAboveTablet && i !== medias.length - 1,
              },
            )}
          >
            <MediaImage
              src={MediaCoverUtils.getUrl(media)}
              classNames={{
                height: "h-[400px] md:h-[498px]",
                width: "w-[280px] md:w-[350px]",
              }}
              maxHeight={498}
              maxWidth={350}
              isZoomed
              alt="media's cover"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
