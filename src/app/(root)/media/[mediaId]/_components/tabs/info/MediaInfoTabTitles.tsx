import { tv } from "@nextui-org/react";

import { CountryFlag } from "~/components/ui/CountryFlag";
import type { MediaLimited } from "~/lib/types";

type Props = { media: MediaLimited };

const mediaInfoTabTitles = tv({
  slots: {
    container: "items-start",
    categoryWrapper: "flex flex-col gap-2 justify-start",
    categoryTitle: "font-semibold text-lg",
    categoryContent: "flex flex-wrap gap-x-6 gap-y-4",
  },
});

export const MediaInfoTabTitles = ({ media }: Props) => {
  const { container, categoryWrapper, categoryTitle, categoryContent } =
    mediaInfoTabTitles();

  return (
    <div className={container()}>
      {media.titles.length > 0 && (
        <div className={categoryWrapper()}>
          <h3 className={categoryTitle()}>Títulos alternativos</h3>
          <div className={categoryContent()}>
            {media.titles.map((item) => (
              <div key={item.title} className="flex items-center gap-2">
                <div className="flex min-h-[24px] min-w-[24px]">
                  <CountryFlag language={item.language} />
                </div>
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
