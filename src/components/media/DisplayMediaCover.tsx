import NextImage from "next/image";
import { Image } from "@nextui-org/image";

import type { MediaLimited } from "~/lib/types";
import { MediaUtils } from "~/lib/utils/media.utils";

type Props = { media: MediaLimited };

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
