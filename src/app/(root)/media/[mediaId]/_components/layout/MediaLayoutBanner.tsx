import NextImage from "next/image";
import { Image } from "@nextui-org/image";

import type { MediaLimited } from "~/lib/types";
import { cn } from "~/lib/utils/cn";
import { MediaUtils } from "~/lib/utils/media.utils";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutBanner = ({ media }: Props) => {
  const bannerUrl = MediaUtils.getBannerOrCoverUrl(media);
  const coverUrl = MediaUtils.getCoverUrl(media);

  return (
    <Image
      as={NextImage}
      src={bannerUrl}
      classNames={{
        wrapper:
          "!max-w-full w-full z-0 after:shadow-[0_-64px_48px_16px_inset_var(--background)]",
        img: cn(
          "object-cover h-[300px] lg:h-[320px] xl:h-[400px] 2xl:h-[550px] w-full rounded-none blur-xs",
          {
            "blur-md": bannerUrl === coverUrl,
          },
        ),
      }}
      height={400}
      width={1200}
      alt="media's banner"
      priority
    />
  );
};
