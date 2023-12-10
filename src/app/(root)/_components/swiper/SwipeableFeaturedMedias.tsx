"use client";

import { Image } from "@nextui-org/image";
import { Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import NextImage from "next/image";
import Link from "next/link";

import type { FeaturedMedia } from "~/lib/types";
import { MediaBannerUtils } from "~/lib/utils/mediaBanner.utils";
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils";

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
    modules={[Mousewheel]}
    // autoplay={{
    //   delay: 5000,
    // }}
  >
    {medias.map((media, i) => (
      <SwiperSlide key={i}>
        <Link
          key={i}
          href={`/media/${media.id}`}
          className="hover:cursor-pointer"
          passHref
        >
          <Image
            as={NextImage}
            src={MediaBannerUtils.getUrl(media)}
            classNames={{
              wrapper: "!max-w-full w-full z-0",
              img: "max-h-[200px] min-h-[200px] w-full object-cover sm:max-h-[250px] sm:min-h-[250px] md:max-h-[300px] md:min-h-[300px] lg:max-h-[350px] lg:min-h-[350px] blur-sm brightness-75",
            }}
            height={350}
            width={1200}
            alt="media's banner"
          />
          <div className="relative z-10 -mt-[200px] flex h-full gap-6 p-4 sm:-mt-[250px] md:-mt-[300px] lg:-mt-[350px]">
            <Image
              as={NextImage}
              src={MediaCoverUtils.getUrl(media)}
              classNames={{
                wrapper: "!max-w-full",
                img: "min-h-full max-h-full w-full min-w-[120px] sm:min-w-[160px] md:min-w-[200px] lg:min-w-[230px] object-cover",
              }}
              height={350}
              width={240}
              alt="media's cover"
            />
            <div className="flex flex-col gap-4 py-4">
              <p className="line-clamp-1 pb-1 text-3xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] md:text-left md:text-4xl xl:text-5xl">
                {media.mainTitle}
              </p>
              <p className="line-clamp-2 italic text-neutral-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                {media.synopsis}
              </p>
            </div>
          </div>
        </Link>
      </SwiperSlide>
    ))}
  </Swiper>
);
