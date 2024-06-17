import type { LatestReleaseGrouped } from "@taiyomoe/types"
import { MediaChapterUtils, MediaCoverUtils, MediaUtils } from "@taiyomoe/utils"
import Link from "next/link"
import { useMemo } from "react"
import { MediaImage } from "~/components/generics/images/MediaImage"
import SparklesText from "~/components/generics/texts/sparkles-text"
import { DateUtils } from "~/lib/utils/date.utils"

type Props = {
  release: LatestReleaseGrouped
}

export const ReleaseCardColumn = ({ release }: Props) => {
  const latestChapters = useMemo(
    () => release.chapters.slice(0, 3),
    [release.chapters],
  )

  return (
    <div className="flex flex-col gap-2">
      <Link href={MediaUtils.getUrl(release)}>
        <MediaImage
          src={MediaCoverUtils.getUrl(release)}
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
        {latestChapters.map((c) => (
          <Link
            key={c.id}
            href={MediaChapterUtils.getUrl(c)}
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
}
