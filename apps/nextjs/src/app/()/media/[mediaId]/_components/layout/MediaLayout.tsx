import NextImage from "next/image";
import { Image } from "@nextui-org/image";

import type { MediaWithRelations } from "@taiyo/db/types";

import { DisplayMediaCover } from "~/components/media/DisplayMediaCover";
import { cn } from "~/utils/cn";
import { MediaUtils } from "~/utils/MediaUtils";

type Props = {
  media: MediaWithRelations;
  children: React.ReactNode;
};

export const MediaLayout = ({ media, children }: Props) => {
  const bannerUrl = MediaUtils.getBannerOrCoverUrl(media);
  const hasBanners = MediaUtils.hasBanners(media);

  return (
    <main className="lg:grid-cols-lgMediaLayout xl:grid-cols-xlMediaLayout 2xl:grid-cols-2xlMediaLayout grid h-full grid-cols-2">
      <Image
        as={NextImage}
        src={bannerUrl}
        classNames={{
          wrapper:
            "remove-maxWidth col-span-2 w-full max-w-full -z-10 after:shadow-[0_-64px_48px_16px_inset_var(--background)]",
          img: cn("object-cover h-[300px] xl:h-[400px] w-full rounded-none", {
            "blur-md": !hasBanners,
          }),
        }}
        sizes="1"
        height={0}
        width={0}
        alt="media's banner"
      />
      <div className="col-span-2 -mt-28 flex h-fit w-full justify-center lg:col-span-1 xl:-mt-36">
        <DisplayMediaCover media={media} />
      </div>
      <div className="col-span-2 w-full lg:col-span-1 lg:-mt-28 xl:-mt-36">
        {children}
      </div>
    </main>
  );
};
