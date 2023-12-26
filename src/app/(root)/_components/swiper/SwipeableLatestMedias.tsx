"use client"

import { Image } from "@nextui-org/image"
import { FreeMode, Mousewheel } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"

import NextImage from "next/image"
import Link from "next/link"

import type { LatestMedia } from "~/lib/types"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"

type Props = {
  medias: LatestMedia[]
}

export const SwipeableLatestMedias = ({ medias }: Props) => (
  <Swiper
    className="latestMedias h-[300px]"
    slidesPerView="auto"
    spaceBetween={24}
    modules={[FreeMode, Mousewheel]}
    mousewheel={{
      sensitivity: 0.5,
    }}
    freeMode={{
      enabled: false,
    }}
  >
    {medias.map((media) => (
      <SwiperSlide key={media.id} className="!w-fit md:!w-auto">
        <Link
          href={`/media/${media.id}`}
          className="relative hover:cursor-pointer"
          passHref
        >
          <Image
            as={NextImage}
            src={MediaCoverUtils.getUrl(media)}
            className="max-h-[300px] min-h-[300px] object-cover"
            height={300}
            width={210}
            alt="media's cover"
            isZoomed
          />
        </Link>
      </SwiperSlide>
    ))}
  </Swiper>
)
