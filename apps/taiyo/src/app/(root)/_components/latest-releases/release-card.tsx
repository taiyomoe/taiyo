import type { LatestRelease } from "@taiyomoe/types"
import { MediaChapterUtils, MediaCoverUtils, MediaUtils } from "@taiyomoe/utils"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { ChapterScansListHorizontal } from "~/components/ui/chapters/chapter-scans-list-horizontal"
import { ChapterTitle } from "~/components/ui/chapters/chapter-title"
import { ChapterUploadedTime } from "~/components/ui/chapters/chapter-uploaded-time"
import { ChapterUploader } from "~/components/ui/chapters/chapter-uploader"

type Props = {
  release: LatestRelease
  index: number
}

export const ReleaseCard = ({ release, index }: Props) => (
  <Link
    id={`release-card-${index}`}
    href={MediaChapterUtils.getUrl(release)}
    className="flex gap-2 rounded-small bg-content1 transition-background hover:bg-content2"
  >
    <object className="inline-table">
      <Link href={MediaUtils.getUrl(release.media)} className="min-w-fit">
        <MediaImage
          src={MediaCoverUtils.getUrl(release.media)}
          classNames={{
            height: "min-h-[80px] h-[80px]",
            width: "min-w-[56px] w-[56px]",
          }}
          maxHeight={80}
          maxWidth={56}
          alt="media's cover"
          radius="sm"
          isZoomed
        />
      </Link>
    </object>
    <div className="flex w-full flex-col justify-between pr-1 pb-1">
      <object>
        <Link
          className="line-clamp-1 font-medium text-medium brightness-[0.6] hover:underline"
          href={MediaUtils.getUrl(release.media)}
        >
          {release.media.mainTitle}
        </Link>
      </object>
      <div className="grid grid-cols-chapterCard grid-rows-2 gap-x-1 gap-y-0.5 text-small">
        <ChapterTitle chapter={release} />
        <ChapterUploadedTime className="min-w-28" chapter={release} />
        <ChapterScansListHorizontal chapter={release} index={index} />
        <ChapterUploader chapter={release} />
      </div>
    </div>
  </Link>
)
