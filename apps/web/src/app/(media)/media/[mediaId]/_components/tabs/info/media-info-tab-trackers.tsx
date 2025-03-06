import { Link } from "@heroui/link"
import type { MediaLimited } from "@taiyomoe/types"
import { TrackerUtils } from "@taiyomoe/utils"
import { Category } from "~/components/generics/Category"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

type Props = {
  media: MediaLimited
}

export const MediaInfoTabTrackers = ({ media }: Props) => (
  <div className="items-start">
    {media.trackers.length > 0 && (
      <Category title="Trackers">
        <div className="flex flex-wrap gap-2">
          {media.trackers.map((item) => (
            <Link
              key={item.tracker}
              href={TrackerUtils.getTrackerUrl(item)}
              className="flex select-none gap-1 rounded-md bg-default-200 px-2 py-1.5 text-foreground text-sm"
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
      </Category>
    )}
  </div>
)
