"use client";

import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Skeleton } from "~/components/ui/Skeleton";
import { api } from "~/utils/api";

import "swiper/css";

import Link from "next/link";

import { MediaUtils } from "~/utils/MediaUtils";

export const SwipeableLatestMedias = () => {
  const { data: medias } = api.medias.getLatestMedias.useQuery();

  const renderSwiper = (items: JSX.Element[]) => (
    <Swiper
      className="latestMedias h-[300px] w-full"
      slidesPerView="auto"
      spaceBetween={24}
      mousewheel={{
        sensitivity: 0.2,
      }}
      freeMode
      modules={[FreeMode, Mousewheel]}
    >
      {items.map((item, i) => (
        <SwiperSlide key={i} className="w-fit md:w-auto">
          {item}
        </SwiperSlide>
      ))}
    </Swiper>
  );

  if (!medias)
    return renderSwiper(
      Array.from({ length: 10 }, (_, i) => (
        <Skeleton key={i} className="h-[300px] w-[200px] rounded-lg" />
      )),
    );

  return renderSwiper(
    medias.map((media, i) => {
      const coverUrl = MediaUtils.getCoverUrl(media);

      if (!coverUrl) return <></>;

      return (
        <Link
          key={i}
          href={`/media/${media.id}`}
          className="h-full hover:cursor-pointer hover:opacity-75"
          passHref
        >
          <img
            className="block h-full rounded-lg object-cover"
            src={coverUrl}
            alt="media's cover"
          />
        </Link>
      );
    }),
  );
};
