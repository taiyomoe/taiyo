"use client"

import { ScrollShadow } from "@nextui-org/scroll-shadow"
import type { LatestMedia } from "@taiyomoe/types"
import { CoverUtils } from "@taiyomoe/utils"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"

type Props = {
  medias: LatestMedia[]
}

export const LatestMediasCarousel = ({ medias }: Props) => {
  const [emblaRef] = useEmblaCarousel({ dragFree: true })

  return (
    <ScrollShadow
      className="scrollbar-none"
      orientation="horizontal"
      ref={emblaRef}
    >
      <div className="flex">
        {medias.map((media) => (
          <Link
            key={media.id}
            href={`/media/${media.id}`}
            className="relative mr-6 max-h-[300px] min-h-[300px] w-fit last:mr-0 hover:cursor-pointer"
          >
            <MediaImage
              src={CoverUtils.getUrl(media)}
              classNames={{
                height: "min-h-[300px] h-[300px]",
                width: "min-w-[210px] w-[210px]",
              }}
              maxHeight={300}
              maxWidth={210}
              alt="media's cover"
              isZoomed
            />
          </Link>
        ))}
      </div>
    </ScrollShadow>
  )
}
