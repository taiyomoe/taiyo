import type { RouterOutputs } from "@taiyomoe/trpc"
import { ClockIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { useDynamicMedias } from "~/app/hooks/use-dynamic-medias"
import { ChapterTitle } from "~/components/ui/chapter-title"
import { Flag } from "~/components/ui/flag"
import { Image } from "~/components/ui/image"
import { RelativeTime } from "~/components/ui/relative-time"
import { Username } from "~/components/ui/username"
import { getCoverUrl } from "~/utils/medias/get-cover-url"

type Props = {
  chapter: RouterOutputs["medias"]["getLatestReleases"][number]
}

export const LatestReleasesCard = ({ chapter }: Props) => {
  const { getDisplayTitle } = useDynamicMedias()

  return (
    <div className="flex rounded border border-subtle bg-muted">
      <Link href={`/medias/${chapter.media.id}`}>
        <Image
          src={getCoverUrl(chapter.media.id, chapter.media.covers[0]!)}
          alt={`${getDisplayTitle(chapter.media.titles)}'s cover`}
          className="aspect-7/10 max-h-[82] min-h-[82] min-w-[56] select-none"
          width={56}
          height={82}
          radius="md"
          shouldZoom
        />
      </Link>
      <div className="flex w-full flex-col justify-between gap-2 p-1.5 text-sm text-subtle">
        <Link
          href={`/medias/${chapter.media.id}`}
          className="line-clamp-1 font-bold text-subtle hover:underline"
        >
          {getDisplayTitle(chapter.media.titles)}
        </Link>
        <div className="grid grid-cols-[auto_112px] grid-rows-2 gap-x-1 gap-y-0.5">
          <Link
            href={`/medias/${chapter.media.id}/chapters/${chapter.id}`}
            className="flex items-center gap-1.5"
          >
            <Flag className="size-3 min-w-fit" language={chapter.language} />
            <ChapterTitle
              className="line-clamp-1 break-all text-default"
              title={chapter.title}
              number={chapter.number}
            />
          </Link>
          <div className="flex items-center justify-end gap-1 text-end">
            <ClockIcon className="size-4 min-w-fit" />
            <RelativeTime date={chapter.createdAt} />
          </div>
          <span className="">Scansfefe</span>
          <div className="flex items-center justify-end gap-1 text-end">
            <UserIcon className="size-4 min-w-fit" />
            <Username user={chapter.uploader} />
          </div>
        </div>
      </div>
    </div>
  )
}
