import NextImage from "next/image";
import { Image } from "@nextui-org/image";

import { DisplayMediaCover } from "~/components/media/DisplayMediaCover";
import type { MediaLimited } from "~/lib/types";
import { cn } from "~/lib/utils/cn";
import { MediaUtils } from "~/lib/utils/media.utils";

import { MediaLayoutTitle } from "./MediaLayoutTitle";

type Props = {
  media: MediaLimited;
  children: React.ReactNode;
};

export const MediaLayout = ({ media, children }: Props) => {
  const bannerUrl = MediaUtils.getBannerOrCoverUrl(media);
  const coverUrl = MediaUtils.getCoverUrl(media);

  return (
    <main className="h-full">
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
      <div className="-mt-28 flex flex-col gap-6 px-6 md:flex-row xl:-mt-36">
        <section className="z-10 flex h-fit flex-col items-center gap-8 md:sticky md:top-[calc(var(--navbar-height)+36px)]">
          <DisplayMediaCover media={media} />
          <MediaLayoutTitle media={media} />
        </section>
        <section className="z-10 flex flex-col md:max-w-[calc(100vw-(250px+80px))] lg:max-w-[calc(100vw-(300px+80px))]">
          {children}
        </section>
      </div>
    </main>
  );
};
