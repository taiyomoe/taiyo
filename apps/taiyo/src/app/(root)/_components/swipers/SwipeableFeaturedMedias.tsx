"use client"

import { Button } from "@nextui-org/react"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { useCallback } from "react"

import type { FeaturedMedia } from "@taiyomoe/types"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { cn } from "~/lib/utils/cn"
import { MediaBannerUtils } from "~/lib/utils/mediaBanner.utils"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"

type Props = {
  medias: FeaturedMedia[]
}

export const SwipeableFeaturedMedias = ({ medias }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({}, [
    Autoplay({ delay: 10000 }),
  ])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="overflow-hidden rounded-2xl">
      <div ref={emblaRef}>
        <div className="flex">
          {medias.map((media, i) => (
            <Link
              key={media.id}
              href={`/media/${media.id}`}
              className={cn(
                "hover:cursor-pointer flex-[0_0_100%] min-w-0 max-h-[200px] min-h-[200px] sm:max-h-[250px] sm:min-h-[250px] md:max-h-[300px] md:min-h-[300px] lg:max-h-[350px] lg:min-h-[350px] z-0",
                { "mr-6": i !== medias.length - 1 },
              )}
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
              <div className="relative z-10 flex h-full gap-6 p-4 -mt-[200px] sm:-mt-[250px] md:-mt-[300px] lg:-mt-[350px]">
                <MediaImage
                  src={MediaCoverUtils.getUrl(media)}
                  classNames={{
                    wrapper: "h-full",
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
                    <p className="drop-shadow-accent line-clamp-1 pb-1 text-3xl font-bold md:text-left md:text-4xl xl:text-5xl hover:opacity-70 transition-all">
                      {media.mainTitle}
                    </p>
                    <p className="drop-shadow-accent line-clamp-2 italic text-neutral-300">
                      {media.synopsis}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-4 relative bottom-[56px] right-4">
        <Button
          className="embla__prev z-10 data-[hover]:bg-primary/30"
          startContent={<ChevronLeftIcon />}
          onPress={scrollPrev}
          color="primary"
          variant="light"
          radius="full"
          isIconOnly
        />
        <Button
          className="embla__next z-10 data-[hover]:bg-primary/30"
          startContent={<ChevronRightIcon />}
          onPress={scrollNext}
          color="primary"
          variant="light"
          radius="full"
          isIconOnly
        />
      </div>
    </div>
  )
}
