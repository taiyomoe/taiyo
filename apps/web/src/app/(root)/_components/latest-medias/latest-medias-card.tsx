import type { RouterOutputs } from "@taiyomoe/trpc"
import Link from "next/link"
import { useDynamicMedias } from "~/app/hooks/use-dynamic-medias"
import { Image } from "~/components/ui/image"
import { getCoverUrl } from "~/utils/medias/get-cover-url"

type Props = {
  media: RouterOutputs["medias"]["getLatest"][number]
}

export const LatestMediasCard = ({ media }: Props) => {
  const { getDisplayTitle } = useDynamicMedias()

  return (
    <Link
      href={`/medias/${media.id}`}
      className="flex flex-col gap-1.5 hover:[&_h4]:text-default hover:md:[&_img]:scale-110"
    >
      <Image
        src={getCoverUrl(media.id, media.covers.at(-1)!)}
        className="aspect-7/10 max-h-[200] min-h-[200] min-w-[140] select-none"
        alt={`${getDisplayTitle(media.titles)}'s cover`}
        width={140}
        height={200}
        radius="md"
      />
      <h4 className="line-clamp-2 overflow-hidden font-medium text-sm text-subtle transition-colors">
        {getDisplayTitle(media.titles)}
      </h4>
    </Link>
  )
}
