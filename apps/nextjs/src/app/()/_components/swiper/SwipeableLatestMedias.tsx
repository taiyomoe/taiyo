"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import { Skeleton } from "~/components/ui/Skeleton";
import { api } from "~/utils/api";

import "swiper/css";

import Link from "next/link";

import { buildCoverUrl } from "~/utils/urlBuilder";

export const SwipeableLatestMedias = () => {
  const { data: medias } = api.medias.getLatestMedias.useQuery();

  const renderSwiper = (items: JSX.Element[]) => (
    <Swiper
      className="latestMedias w-full"
      slidesPerView="auto"
      spaceBetween={24}
      wrapperClass="min-w-fit"
    >
      {items.map((item, index) => (
        <SwiperSlide key={index} className="w-fit">
          {item}
        </SwiperSlide>
      ))}
    </Swiper>
  );

  if (!medias)
    return renderSwiper(
      Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} className="h-[300px] w-[200px]" />
      )),
    );

  return renderSwiper(
    medias.map((media, i) => {
      const coverId = media.covers.at(0)?.id;

      if (!coverId) return <></>;

      const coverUrl = buildCoverUrl(media.id, coverId);

      return (
        <Link
          key={i}
          href={`/media/${media.id}`}
          className="flex h-[300px] w-[200px] flex-col hover:cursor-pointer hover:opacity-75"
          passHref
        >
          <img
            className="block h-[300px] max-h-full w-full rounded-lg object-cover"
            src={coverUrl}
            alt="media's cover"
          />
        </Link>
      );
    }),
  );
};
