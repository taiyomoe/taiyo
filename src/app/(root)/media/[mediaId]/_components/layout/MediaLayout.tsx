import type { MediaLimited } from "~/lib/types";

import { MediaLayoutBanner } from "./MediaLayoutBanner";
import { MediaLayoutCover } from "./MediaLayoutCover";
import { MediaLayoutTitle } from "./MediaLayoutTitle";

type Props = {
  media: MediaLimited;
  children: React.ReactNode;
};

export const MediaLayout = ({ media, children }: Props) => {
  return (
    <main className="h-full">
      <MediaLayoutBanner media={media} />
      <div className="-mt-28 flex flex-col gap-6 px-6 md:flex-row xl:-mt-36">
        <section className="z-10 flex h-fit flex-col items-center gap-8 md:sticky md:top-[calc(var(--navbar-height)+36px)]">
          <MediaLayoutCover media={media} />
          <MediaLayoutTitle media={media} />
        </section>
        <section className="z-10 flex flex-col md:w-[calc(100vw-(250px+80px))] lg:w-[calc(100vw-(300px+80px))]">
          {children}
        </section>
      </div>
    </main>
  );
};
