import NextImage from "next/image";
import { Image } from "@nextui-org/image";

import { DisplayMediaCover } from "~/components/media/DisplayMediaCover";
import type { MediaLimited } from "~/lib/types";
import { cn } from "~/lib/utils/cn";
import { MediaUtils } from "~/lib/utils/media.utils";

type Props = {
  media: MediaLimited;
  children: React.ReactNode;
};

export const MediaLayout = ({ media, children }: Props) => {
  const bannerUrl = MediaUtils.getBannerOrCoverUrl(media);
  const coverUrl = MediaUtils.getCoverUrl(media);

  return (
    <main className="grid h-full grid-cols-2 lg:grid-cols-lgMediaLayout xl:grid-cols-xlMediaLayout 2xl:grid-cols-2xlMediaLayout">
      <Image
        as={NextImage}
        src={bannerUrl}
        classNames={{
          wrapper:
            "!max-w-full col-span-2 w-full z-0 after:shadow-[0_-64px_48px_16px_inset_var(--background)]",
          img: cn(
            "object-cover h-[300px] xl:h-[400px] w-full rounded-none blur-xs",
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
      <div className="col-span-2 -mt-28 flex h-fit w-full justify-center lg:col-span-1 xl:-mt-36">
        <DisplayMediaCover media={media} />
      </div>
      <div className="z-10 col-span-2 w-full lg:col-span-1 lg:-mt-28 xl:-mt-36">
        {children}
      </div>
    </main>
  );
};
