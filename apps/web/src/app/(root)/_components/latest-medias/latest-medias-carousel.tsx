"use client"

import { ScrollShadow } from "@heroui/scroll-shadow"
import type { LatestMedia } from "@taiyomoe/types"
import { CoverUtils } from "@taiyomoe/utils"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import { CarouselButtons } from "~/components/generics/buttons/carousel-buttons"
import { MediaImage } from "~/components/images/MediaImage"

type Props = {
  medias: LatestMedia[]
}

export const LatestMediasCarousel = ({ medias }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true })

  return (
    <div className="relative">
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
      <CarouselButtons
        className="-top-[52px] absolute right-0"
        onPrev={() => emblaApi?.scrollPrev()}
        onNext={() => emblaApi?.scrollNext()}
      />
    </div>
  )
}
