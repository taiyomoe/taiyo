"use client"

import { Image } from "@nextui-org/image"
import useEmblaCarousel from "embla-carousel-react"

import NextImage from "next/image"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"

import type { LatestMedia } from "~/lib/types"
import { cn } from "~/lib/utils/cn"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"

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
              "relative hover:cursor-pointer w-fit min-h-[300px] max-h-[300px]",
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
