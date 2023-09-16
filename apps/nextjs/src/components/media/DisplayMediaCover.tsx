import type { MediaWithRelations } from "@taiyo/db";

import { MediaUtils } from "~/utils/MediaUtils";
import { Image } from "../ui/Image";
import type { ImageProps } from "../ui/Image";

type Props = Partial<ImageProps> & { media: MediaWithRelations | undefined };

export const DisplayMediaCover = ({ media, ...rest }: Props) => {
  const coverUrl = MediaUtils.getCoverUrl(media);

  return (
    <Image
      src={coverUrl}
      className="rounded-xl object-cover"
      width={0}
      height={0}
      style={{
        width: "300px",
        height: "400px",
      }}
      sizes="1"
      alt="media's cover"
      classes={{
        container: "rounded-xl bg-background shadow-2xl",
      }}
      skeletonProps={{
        className: "shadow-2xl shadow-background",
      }}
      {...rest}
    />
  );
};
