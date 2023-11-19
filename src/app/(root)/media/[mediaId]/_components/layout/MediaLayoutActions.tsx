import type { MediaLimited } from "~/lib/types";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutActions = ({ media }: Props) => {
  return (
    <div className="flex h-28 flex-col justify-end gap-2 py-3 xl:h-36">
      <p className="line-clamp-1 h-[44px] text-center text-2xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] md:text-left md:text-4xl">
        {media.mainTitle}
      </p>
    </div>
  );
};
