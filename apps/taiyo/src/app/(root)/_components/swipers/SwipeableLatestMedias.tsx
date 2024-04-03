"use client"

import type { LatestMedia } from "@taiyomoe/types"
import { MediaCoverUtils } from "@taiyomoe/utils"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { cn } from "~/lib/utils/cn"

type Props = {
  medias: LatestMedia[]
}

export const SwipeableLatestMedias = ({ medias }: Props) => {
  const [emblaRef] = useEmblaCarousel({ dragFree: true })

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {medias.map((media, i) => (
          <Link
            key={media.id}
            href={`/media/${media.id}`}
            className={cn(
              "relative max-h-[300px] min-h-[300px] w-fit hover:cursor-pointer",
              {
                "mr-6": i !== medias.length - 1,
              },
            )}
          >
            <MediaImage
              src={MediaCoverUtils.getUrl(media)}
              classNames={{
                wrapper: "h-full",
                height: "h-full",
                width: "min-w-[210px]",
              }}
              maxHeight={300}
              maxWidth={210}
              isZoomed
              alt="media's cover"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
