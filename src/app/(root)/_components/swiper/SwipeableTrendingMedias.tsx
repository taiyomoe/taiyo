"use client"

import { Image } from "@nextui-org/image"
import { FreeMode, Mousewheel, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/pagination"

import NextImage from "next/image"
import Link from "next/link"

import type { LatestMedia } from "~/lib/types"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"

type Props = {
  medias: LatestMedia[]
}

export const SwipeableTrendingMedias = ({ medias }: Props) => (
  <Swiper
    direction="horizontal"
    slidesPerView="auto"
    className="trendingMedias h-[400px] w-full md:h-[498px] md:w-[350px]"
    spaceBetween={24}
    freeMode
    breakpoints={{
      // MD and up
      768: {
        direction: "vertical",
        freeMode: false,
        slidesPerView: 1,
      },
    }}
    pagination={{
      clickable: true,
      dynamicBullets: true,
    }}
    mousewheel={{
      sensitivity: 0.2,
    }}
    modules={[Pagination, FreeMode, Mousewheel]}
  >
    {medias.map((media) => (
      <SwiperSlide key={media.id}>
        <Link
          href={`/media/${media.id}`}
          className="relative hover:cursor-pointer"
          passHref
        >
          <Image
            as={NextImage}
            src={MediaCoverUtils.getUrl(media)}
            className="max-h-[400px] min-h-[400px] w-[280px] object-cover md:max-h-[498px] md:min-h-[498px] md:w-[350px]"
            width={350}
            height={0}
            alt="media's cover"
            isZoomed
          />
        </Link>
      </SwiperSlide>
    ))}
  </Swiper>
)
