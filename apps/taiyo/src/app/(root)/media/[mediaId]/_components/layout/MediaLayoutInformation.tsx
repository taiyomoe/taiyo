import { Link, tv } from "@nextui-org/react"

import type { MediaLimited } from "@taiyomoe/types"
import { CompanyLogo } from "~/components/ui/CompanyLogo"
import { TrackerUtils } from "~/lib/utils/tracker.utils"

type Props = { media: MediaLimited }

const mediaLayoutInformation = tv({
  slots: {
    container: "items-start w-[300px]",
    categoryWrapper: "flex flex-col gap-2 justify-start",
    categoryTitle: "font-semibold text-lg",
    categoryContent: "flex flex-wrap gap-2",
  },
})

export const MediaLayoutInformation = ({ media }: Props) => {
  const { container, categoryWrapper, categoryTitle, categoryContent } =
    mediaLayoutInformation()

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
                className="flex gap-1 rounded-md bg-default-200 px-2 py-1.5 text-sm text-foreground"
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
  )
}
