"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

type Props = { items: JSX.Element[] };

export const SwipeableLatestMedias = ({ items }: Props) => {
  return (
    <Swiper className="w-full" slidesPerView="auto" spaceBetween={24}>
      {items.map((item, index) => (
        <SwiperSlide key={index} className="w-fit">
          {item}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
