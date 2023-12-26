"use client"

import { Autoplay, Mousewheel } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/pagination"

import Link from "next/link"

import { MediaImage } from "~/components/generics/images/MediaImage"
import type { FeaturedMedia } from "~/lib/types"
import { MediaBannerUtils } from "~/lib/utils/mediaBanner.utils"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"

type Props = {
  medias: FeaturedMedia[]
}

export const SwipeableFeaturedMedias = ({ medias }: Props) => (
  <Swiper
    className="featuredMedias h-[200px] rounded-2xl sm:h-[250px] md:h-[300px] lg:h-[350px]"
    slidesPerView="auto"
    spaceBetween={24}
    mousewheel={{
      sensitivity: 0.2,
    }}
    modules={[Autoplay, Mousewheel]}
    autoplay={{
      delay: 10000,
    }}
  >
    {medias.map((media) => (
      <SwiperSlide key={media.id}>
        <Link
          href={`/media/${media.id}`}
          className="hover:cursor-pointer"
          passHref
        >
          <MediaImage
            src={MediaBannerUtils.getUrl(media)}
            classNames={{
              height:
                "max-h-[200px] min-h-[200px] sm:max-h-[250px] sm:min-h-[250px] md:max-h-[300px] md:min-h-[300px] lg:max-h-[350px] lg:min-h-[350px]",
              width: "w-full",
              img: "blur-sm brightness-50",
            }}
            maxHeight={350}
            maxWidth={1200}
            alt="media's banner"
          />
          <div className="relative z-10 -mt-[200px] flex h-full gap-6 p-4 sm:-mt-[250px] md:-mt-[300px] lg:-mt-[350px]">
            <MediaImage
              src={MediaCoverUtils.getUrl(media)}
              classNames={{
                height: "min-h-full max-h-full",
                width:
                  "min-w-[120px] sm:min-w-[160px] md:min-w-[200px] lg:min-w-[230px]",
              }}
              maxHeight={350}
              maxWidth={230}
              alt="media's cover"
            />
            <div className="flex flex-col gap-4 py-4">
              <p className="drop-shadow-accent line-clamp-1 pb-1 text-3xl font-bold md:text-left md:text-4xl xl:text-5xl">
                {media.mainTitle}
              </p>
              <p className="drop-shadow-accent line-clamp-2 italic text-neutral-300">
                {media.synopsis}
              </p>
            </div>
          </div>
        </Link>
      </SwiperSlide>
    ))}
  </Swiper>
)
