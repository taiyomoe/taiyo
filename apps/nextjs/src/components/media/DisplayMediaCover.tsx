import NextImage from "next/image";
import { Image } from "@nextui-org/image";

import type { MediaWithCovers } from "@taiyo/db";

import { MediaUtils } from "~/utils/MediaUtils";

type Props = { media: MediaWithCovers };

export const DisplayMediaCover = ({ media }: Props) => {
  const coverUrl = MediaUtils.getCoverUrl(media);

  return (
    <Image
      as={NextImage}
      classNames={{
        img: "object-cover w-[300px] h-[400px]",
      }}
      sizes="1"
      width={300}
      height={400}
      src={coverUrl}
      alt="media's cover"
      priority
      isBlurred
    />
  );
};
