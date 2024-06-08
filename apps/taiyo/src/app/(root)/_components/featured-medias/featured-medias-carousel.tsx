"use client"

import type { FeaturedMedia } from "@taiyomoe/types"
import { MediaBannerUtils, MediaCoverUtils } from "@taiyomoe/utils"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { FeaturedMediaControlButtons } from "./featured-medias-control-buttons"

type Props = {
  medias: FeaturedMedia[]
}

export const FeaturedMediasCarousel = ({ medias }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({}, [
    Autoplay({ delay: 10000 }),
  ])

  return (
    <div className="relative overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {medias.map((media) => (
          <Link
            key={media.id}
            href={`/media/${media.id}`}
            className="mr-6 max-h-[200px] min-h-[200px] min-w-0 flex-[0_0_100%] last:mr-0 lg:max-h-[350px] md:max-h-[300px] sm:max-h-[250px] lg:min-h-[350px] md:min-h-[300px] sm:min-h-[250px] hover:cursor-pointer"
          >
            <MediaImage
              src={MediaBannerUtils.getUrl(media)}
              classNames={{
                wrapper: "h-full",
                height: "h-full",
                width: "w-full",
                img: "blur-sm brightness-50",
              }}
              maxHeight={350}
              maxWidth={1200}
              alt="media's banner"
            />
            <div className="-mt-[200px] sm:-mt-[250px] md:-mt-[300px] lg:-mt-[350px] relative z-10 flex h-full gap-6 p-4">
              <MediaImage
                src={MediaCoverUtils.getUrl(media)}
                classNames={{
                  wrapper: "h-full z-10",
                  height: "h-full",
                  width:
                    "min-w-[120px] sm:min-w-[160px] md:min-w-[190px] lg:min-w-[230px]",
                }}
                maxHeight={350}
                maxWidth={230}
                alt="media's cover"
                isZoomed
              />
              <div className="flex flex-col justify-between py-4">
                <div className="flex flex-col gap-4">
                  <p className="line-clamp-1 pb-1 font-bold text-3xl drop-shadow-accent transition-all md:text-left md:text-4xl xl:text-5xl hover:opacity-70">
                    {media.mainTitle}
                  </p>
                  <p className="line-clamp-2 text-neutral-300 italic drop-shadow-accent">
                    {media.synopsis}
                  </p>
                </div>
              </div>
              <span className="absolute bottom-0 left-0 z-0 h-24 w-full [background:linear-gradient(to_bottom,transparent,rgb(22_22_26/1))]" />
            </div>
          </Link>
        ))}
      </div>
      <FeaturedMediaControlButtons
        onPrev={() => emblaApi?.scrollPrev()}
        onNext={() => emblaApi?.scrollNext()}
      />
    </div>
  )
}
