"use client";

import { useCallback } from "react";

import { useScrollOpacity } from "~/hooks/useScrollOpacity";
import type { MediaLimited } from "~/lib/types";

type Props = { media: MediaLimited };

export const MediaLayoutTitle = ({ media }: Props) => {
  const { opacity } = useScrollOpacity({ min: 200, max: 300 });

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <h2
      className="line-clamp-2 hidden text-center text-2xl font-semibold transition-all hover:cursor-pointer hover:underline md:block"
      style={{ opacity }}
      onClick={handleClick}
    >
      {media.mainTitle}
    </h2>
  );
};
