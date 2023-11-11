"use client";

import { useScrollOpacity } from "~/hooks/useScrollOpacity";
import type { MediaLimited } from "~/lib/types";

type Props = { media: MediaLimited };

export const MediaLayoutTitle = ({ media }: Props) => {
  const { opacity } = useScrollOpacity({ min: 200, max: 300 });

  return (
    <h2 className="line-clamp-2 text-2xl font-semibold" style={{ opacity }}>
      {media.title}
    </h2>
  );
};
