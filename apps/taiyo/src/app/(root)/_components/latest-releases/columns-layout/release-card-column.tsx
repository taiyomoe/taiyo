import type { LatestReleaseGroupedLite } from "@taiyomoe/types"
import { ChapterUtils, CoverUtils, MediaUtils } from "@taiyomoe/utils"
import Link from "next/link"
import SparklesText from "~/components/generics/texts/sparkles-text"
import { MediaImage } from "~/components/images/MediaImage"
import { DateUtils } from "~/lib/utils/date.utils"

type Props = {
  release: LatestReleaseGroupedLite
}

export const ReleaseCardColumn = ({ release }: Props) => (
  <div className="flex flex-col gap-2">
    <Link href={MediaUtils.getUrl(release)}>
      <MediaImage
        src={CoverUtils.getUrl(release)}
        classNames={{
          height: "min-h-[270px] h-[270px]",
          width: "min-w-[200px] w-[200px]",
        }}
        maxHeight={270}
        maxWidth={200}
        alt="media's cover"
        isZoomed
      />
    </Link>
    <div className="flex flex-col gap-1 text-small">
      {release.chapters.map((c) => (
        <Link
          key={c.id}
          href={ChapterUtils.getUrl(c)}
          className="flex items-center justify-between rounded-small border border-content2 bg-content1 p-2 font-medium transition-background hover:bg-content2 hover:underline"
        >
          Cap. {c.number}
          {DateUtils.isLessThanDays(c.createdAt, 1) && (
            <SparklesText text="Novo" className="text-base" />
          )}
        </Link>
      ))}
    </div>
  </div>
)
