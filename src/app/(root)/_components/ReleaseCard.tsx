import { Image } from "@nextui-org/image"
import NextImage from "next/image"
import Link from "next/link"

import { MediaChapterScans } from "~/components/ui/MediaChapterScans"
import { MediaChapterCardUploadedTime } from "~/components/ui/MediaChapterUploadedTime"
import { MediaChapterUploader } from "~/components/ui/MediaChapterUploader"
import type { LatestRelease } from "~/lib/types"
import { MediaUtils } from "~/lib/utils/media.utils"
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"

type Props = {
  release: LatestRelease
}

export const ReleaseCard = ({ release }: Props) => {
  return (
    <div className="flex gap-2">
      <Link href={MediaChapterUtils.getUrl(release)}>
        <Image
          as={NextImage}
          src={MediaCoverUtils.getUrl(release.media)}
          className="max-h-[150px] min-h-[150px] min-w-[100px] object-cover"
          height={150}
          width={100}
          radius="md"
          alt="media's cover"
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
