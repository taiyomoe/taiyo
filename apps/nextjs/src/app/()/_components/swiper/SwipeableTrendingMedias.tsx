"use client";

import { FreeMode, Mousewheel, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Skeleton } from "~/components/ui/Skeleton";
import { api } from "~/utils/api";

import "swiper/css";
import "swiper/css/pagination";

import Link from "next/link";

import { cn } from "~/utils/cn";
import { MediaUtils } from "~/utils/MediaUtils";

export const SwipeableTrendingMedias = () => {
  const { data: medias, isFetching } = api.medias.getLatestMedias.useQuery();
  const sizeClasses = "h-[400px] md:h-[498px] w-full md:w-[350px]";

  const renderSwiper = (items: JSX.Element[]) => (
    <Swiper
      direction="horizontal"
      slidesPerView="auto"
      className={cn(sizeClasses, "trendingMedias")}
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
      {items.map((item, i) => (
        <SwiperSlide key={i}>{item}</SwiperSlide>
      ))}
    </Swiper>
  );

  if (isFetching || !medias || medias.length === 0)
    return renderSwiper(
      Array.from({ length: 20 }, (_, i) => (
        <Skeleton key={i} className={cn(sizeClasses, "w-[280px] rounded-xl")} />
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
            className="block h-full w-full rounded-xl object-cover"
            src={coverUrl}
            alt="media's cover"
          />
        </Link>
      );
    }),
  );
};
