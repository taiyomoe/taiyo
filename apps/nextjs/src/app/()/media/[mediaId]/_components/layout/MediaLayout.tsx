import type { MediaWithRelations } from "@taiyo/db";

import { DisplayMediaCover } from "~/components/media/DisplayMediaCover";
import { Image } from "~/components/ui/Image";
import { MediaUtils } from "~/utils/MediaUtils";

type Props = {
  media: MediaWithRelations;
  children: React.ReactNode;
};

export const MediaLayout = ({ media, children }: Props) => {
  const bannerUrl = MediaUtils.getBannerUrl(media);

  return (
    <main className="lg:grid-cols-lgMediaLayout xl:grid-cols-xlMediaLayout 2xl:grid-cols-2xlMediaLayout grid h-full grid-cols-2">
      <Image
        src={bannerUrl}
        width={0}
        height={0}
        className="h-[300px] w-full rounded-none object-cover xl:h-[400px]"
        alt="media's banner"
        classes={{
          container: "col-span-2 -z-50",
        }}
      />
      <div className="col-span-2 -mt-28 flex h-fit w-full justify-center bg-amber-900 bg-opacity-50 lg:col-span-1 xl:-mt-36">
        <DisplayMediaCover media={media} />
      </div>
      <div className="col-span-2 w-full bg-green-900 bg-opacity-50 lg:col-span-1 lg:-mt-28 xl:-mt-36">
        {children}
      </div>
    </main>
  );
};
