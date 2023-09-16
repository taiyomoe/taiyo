import type { MediaWithRelations } from "@taiyo/db";

import { DisplayMediaCover } from "~/components/media/DisplayMediaCover";
import { Image } from "~/components/ui/Image";
import { MediaUtils } from "~/utils/MediaUtils";

type Props = {
  media: MediaWithRelations | undefined;
  children: React.ReactNode;
};

export const MediaLayout = ({ media, children }: Props) => {
  const bannerUrl = MediaUtils.getBannerUrl(media);

  return (
    <main className=" grid h-full grid-cols-3">
      <Image
        src={bannerUrl}
        width={0}
        height={0}
        style={{ width: "100%", height: "300px", objectFit: "cover" }}
        alt="media's banner"
        classes={{
          container: "col-span-3 -z-50",
        }}
      />
      <div className="col-span-3 -mt-36 flex h-fit justify-center bg-amber-900 bg-opacity-50 lg:col-span-1">
        <DisplayMediaCover media={media} />
      </div>
      <div className="col-span-3 bg-green-900 bg-opacity-50 lg:col-span-2 lg:-mt-36">
        {children}
      </div>
    </main>
  );
};
