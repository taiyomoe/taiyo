import type { MediaWithRelations } from "@taiyo/db/schema/medias";

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
          container: "col-span-3",
          // "from-transparent to-black from-0% via-60% to-80% bg-gradient-to-b",
          // "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%",
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
