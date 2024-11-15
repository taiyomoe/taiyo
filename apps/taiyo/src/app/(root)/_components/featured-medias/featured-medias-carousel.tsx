"use client"
import type { FeaturedMedia } from "@taiyomoe/types"
import { BannerUtils, CoverUtils } from "@taiyomoe/utils"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import { CarouselButtons } from "~/components/generics/buttons/carousel-buttons"
import { MediaImage } from "~/components/images/MediaImage"

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
            className="mr-6 max-h-mediasBanner min-h-mediasBanner min-w-0 flex-[0_0_100%] last:mr-0 hover:cursor-pointer"
          >
            <MediaImage
              src={BannerUtils.getUrl(media)}
              classNames={{
                wrapper: "h-full",
                height: "h-full",
                width: "w-full",
                img: "blur-sm brightness-50",
              }}
              maxHeight={410}
              maxWidth={1200}
              alt="Media's banner"
            />
            <div className="-mt-mediasBannerContent relative z-10 flex h-full max-h-mediasBannerContent gap-6 px-4 pt-2 pb-6">
              <MediaImage
                src={CoverUtils.getUrl(media)}
                classNames={{
                  wrapper: "h-full z-10",
                  height: "h-[168px] sm:h-[218px] md:h-[268px] lg:h-[318px]",
                  width:
                    "min-w-[120px] sm:min-w-[160px] md:min-w-[200px] lg:min-w-[230px]",
                  img: "max-h-full",
                }}
                maxHeight={318}
                maxWidth={230}
                alt="media's cover"
                isZoomed
              />
              <div className="flex flex-col justify-between py-4">
                <div className="flex flex-col gap-4">
                  <p className="line-clamp-1 pb-1 font-bold text-3xl drop-shadow-accent transition-all hover:opacity-70 md:text-left md:text-4xl xl:text-5xl">
                    {media.mainTitle}
                  </p>
                  <p className="line-clamp-2 text-neutral-300 italic drop-shadow-accent sm:line-clamp-3 md:line-clamp-4 lg:line-clamp-6">
                    {media.synopsis}
                  </p>
                </div>
              </div>
              <span className="absolute bottom-0 left-0 z-0 h-24 w-full [background:linear-gradient(to_bottom,transparent,rgb(22_22_26/1))]" />
            </div>
          </Link>
        ))}
      </div>
      <CarouselButtons
        className="absolute right-4 bottom-4"
        onPrev={() => emblaApi?.scrollPrev()}
        onNext={() => emblaApi?.scrollNext()}
      />
    </div>
  )
}
