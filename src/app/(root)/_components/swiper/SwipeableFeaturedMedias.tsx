"use client";

import { Image } from "@nextui-org/image";
import { Autoplay, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import NextImage from "next/image";
import Link from "next/link";

import type { FeaturedMedia } from "~/lib/types";
import { MediaBannerUtils } from "~/lib/utils/mediaBanner.utils";

type Props = {
  medias: FeaturedMedia[];
};

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
      delay: 5000,
    }}
  >
    {medias.map((media, i) => (
      <SwiperSlide key={i}>
        <Link
          key={i}
          href={`/media/${media.id}`}
          className="relative hover:cursor-pointer"
          passHref
        >
          <Image
            as={NextImage}
            src={MediaBannerUtils.getUrl(media)}
            classNames={{
              wrapper: "sticky z-0",
              img: "max-h-[200px] min-h-[200px] w-full object-cover sm:max-h-[250px] sm:min-h-[250px] md:max-h-[300px] md:min-h-[300px] lg:max-h-[350px] lg:min-h-[350px] blur-sm",
            }}
            width={1200}
            height={350}
            alt="media's cover"
          />
          <p className="z-10">azert</p>
        </Link>
      </SwiperSlide>
    ))}
  </Swiper>
);
