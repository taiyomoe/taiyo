import type { LatestRelease } from "@taiyomoe/types"
import { MediaChapterUtils, MediaCoverUtils, MediaUtils } from "@taiyomoe/utils"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { MediaChapterScans } from "~/components/ui/MediaChapterScans"
import { MediaChapterCardUploadedTime } from "~/components/ui/MediaChapterUploadedTime"
import { MediaChapterUploader } from "~/components/ui/MediaChapterUploader"

type Props = {
  release: LatestRelease
}

export const ReleaseCard = ({ release }: Props) => {
  return (
    <div className="flex gap-2">
      <Link href={MediaUtils.getUrl(release.media)}>
        <MediaImage
          src={MediaCoverUtils.getUrl(release.media)}
          classNames={{
            height: "min-h-[150px] h-[150px]",
            width: "min-w-[105px] w-[105px]",
          }}
          maxHeight={150}
          maxWidth={105}
          alt="media's cover"
          radius="sm"
          isZoomed
        />
      </Link>
      <div className="flex grow flex-col justify-between py-1">
        <div>
          <Link
            href={MediaUtils.getUrl(release.media)}
            className="line-clamp-1 text-medium font-medium brightness-[0.6] hover:underline"
          >
            {release.media.mainTitle}
          </Link>
          <Link
            href={MediaChapterUtils.getUrl(release)}
            className="line-clamp-2"
          >
            Capítulo <span className="font-medium">{release.number}</span>
            {release.title && ` — ${release.title}`}
          </Link>
        </div>
        <div className="flex flex-col gap-2 brightness-[0.6]">
          <MediaChapterUploader uploader={release.uploader} />
          {release.scans.length !== 0 && (
            <MediaChapterScans scans={release.scans} isCompact />
          )}
          <MediaChapterCardUploadedTime
            className="justify-start"
            chapter={release}
          />
        </div>
      </div>
    </div>
  )
}
