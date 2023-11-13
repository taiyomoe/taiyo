import { Link } from "@nextui-org/link";
import { tv } from "@nextui-org/react";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import type { MediaLimited } from "~/lib/types";
import { TrackerUtils } from "~/lib/utils/tracker.utils";

type Props = { media: MediaLimited };

const mediaInfoTabTrackers = tv({
  slots: {
    container: "items-start",
    categoryWrapper: "flex flex-col gap-2 justify-start",
    categoryTitle: "font-semibold text-lg",
    categoryContent: "flex flex-wrap gap-2",
  },
});

export const MediaInfoTabTrackers = ({ media }: Props) => {
  const { container, categoryWrapper, categoryTitle, categoryContent } =
    mediaInfoTabTrackers();

  return (
    <div className={container()}>
      {media.trackers.length > 0 && (
        <div className={categoryWrapper()}>
          <h3 className={categoryTitle()}>Trackers</h3>
          <div className={categoryContent()}>
            {media.trackers.map((item) => (
              <Link
                key={item.tracker}
                href={TrackerUtils.getTrackerUrl(item)}
                className="flex select-none gap-1 rounded-md bg-default-200 px-2 py-1.5 text-sm text-foreground"
              >
                <CompanyLogo
                  company={item.tracker}
                  className="rounded-sm"
                  height={16}
                />
                {TrackerUtils.getTrackerLabel(item.tracker)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
