"use client";

import { Image } from "@nextui-org/image";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import NextImage from "next/image";
import Link from "next/link";

import type { LatestMedia } from "~/lib/types";
import { MediaUtils } from "~/lib/utils/media.utils";

type Props = {
  medias: LatestMedia[];
};

export const SwipeableLatestMedias = ({ medias }: Props) => (
  <Swiper
    className="latestMedias h-[300px]"
    slidesPerView="auto"
    spaceBetween={24}
    mousewheel={{
      sensitivity: 0.2,
    }}
    modules={[FreeMode, Mousewheel]}
    freeMode
  >
    {medias.map((media, i) => (
      <SwiperSlide key={i} className="!w-fit md:!w-auto">
        <Link
          key={i}
          href={`/media/${media.id}`}
          className="relative hover:cursor-pointer"
          passHref
        >
          <Image
            as={NextImage}
            src={MediaUtils.getCoverUrl(media)}
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
);
