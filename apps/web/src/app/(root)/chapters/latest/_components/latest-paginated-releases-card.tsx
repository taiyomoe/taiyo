import type { RouterOutputs } from "@taiyomoe/trpc"
import { ClockIcon, UserIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { useDynamicMedias } from "~/app/hooks/use-dynamic-medias"
import { GroupHoverCard } from "~/components/hover-cards/group/group-hover-card"
import { UserHoverCard } from "~/components/hover-cards/user/user-hover-card"
import { ChapterTitle } from "~/components/ui/chapter-title"
import { Flag } from "~/components/ui/flag"
import { Image } from "~/components/ui/image"
import { RelativeTime } from "~/components/ui/relative-time"
import { Separator } from "~/components/ui/separator"
import { getCoverUrl } from "~/utils/medias/get-cover-url"

type Props = {
  media: RouterOutputs["chapters"]["getPaginatedLatestReleases"][number]
}

export const LatestPaginatedReleasesCard = ({ media }: Props) => {
  const { getDisplayTitle } = useDynamicMedias()

  return (
    <div>
      <Link
        href={`/medias/${media.id}`}
        className="line-clamp-1 font-bold text-lg text-subtle hover:underline"
      >
        {getDisplayTitle(media.titles)}
      </Link>
      <Separator className="mt-1 mb-2 w-full" />
      <div className="flex gap-2">
        <Link href={`/medias/${media.id}`} className="shrink-0">
          <Image
            src={getCoverUrl(media.id, media.covers.at(-1)!)}
            className="aspect-7/10 max-h-[80] min-h-[80] select-none md:max-h-[200] md:min-h-[200]"
            classNames={{
              base: "sticky top-[calc(var(--navbar-height)+8px)]",
            }}
            width={140}
            height={200}
            radius="md"
            alt={`${getDisplayTitle(media.titles)}'s cover`}
            shouldZoom
          />
        </Link>
        <div className="flex w-full flex-col gap-1">
          {media.chapters.map((c) => (
            <div
              key={c.id}
              className="flex h-fit w-full flex-col justify-between gap-2 rounded border border-subtle bg-muted p-1.5 pr-2 text-sm text-subtle"
            >
              <div className="grid grid-cols-[auto_112px] grid-rows-2 gap-x-1 gap-y-0.5">
                <Link
                  href={`/medias/${media.id}/chapters/${c.id}`}
                  className="flex items-center gap-1.5 hover:[&_span]:text-primary"
                >
                  <Flag className="size-3 min-w-fit" language={c.language} />
                  <ChapterTitle
                    className="line-clamp-1 break-all text-default transition-colors"
                    title={c.title}
                    number={c.number}
                  />
                </Link>
                <div className="flex items-center justify-end gap-2 text-end">
                  <ClockIcon className="size-4 min-w-fit" />
                  <RelativeTime date={c.createdAt} />
                </div>
                {c.groups.length > 0 && (
                  <div className="flex items-center gap-2">
                    <UsersIcon className="size-4 min-w-fit" />
                    {c.groups.map((g) => (
                      <GroupHoverCard key={g.id} group={g} />
                    ))}
                  </div>
                )}
                {c.groups.length === 0 && <div />}
                <div className="flex items-center justify-end gap-2 text-end">
                  <UserIcon className="size-4 min-w-fit" />
                  <UserHoverCard user={c.uploader} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
