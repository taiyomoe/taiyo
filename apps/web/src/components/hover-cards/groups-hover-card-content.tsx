import { useQuery } from "@tanstack/react-query"
import { LinkIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { DiscordLogo } from "~/components/logos/discord-logo"
import { XLogo } from "~/components/logos/x-logo"
import { HoverCardContent } from "~/components/ui/hover-card"
import { Image } from "~/components/ui/image"
import { ScrollShadow } from "~/components/ui/scroll-shadow"
import { getBannerUrl } from "~/utils/groups/get-banner-url"
import { getLogoUrl } from "~/utils/groups/get-logo-url"
import { useTRPC } from "~/utils/trpc/react"
import { GroupsHoverCardContentSkeleton } from "./groups-hover-card-content-skeleton"

type Props = { id: string }

export const GroupsHoverCardContent = ({ id }: Props) => {
  const t = useTranslations("global")
  const trpc = useTRPC()
  const { data, isFetching } = useQuery(
    trpc.groups.getHoverCardContent.queryOptions(id),
  )

  if (isFetching || !data) {
    return <GroupsHoverCardContentSkeleton />
  }

  return (
    <HoverCardContent className="relative w-90">
      <div className="-mx-3 -mt-3">
        <Image
          src={getBannerUrl(data)}
          className="max-h-16 min-h-16 select-none object-cover"
          height={64}
          width={358}
          radius="none"
          alt={`${data.name}'s banner`}
        />
        <div className="absolute top-0 h-full max-h-16 w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))]" />
      </div>
      <div className="-mt-6 flex items-end gap-2">
        <Image
          src={getLogoUrl(data)}
          className="max-size-12 min-size-12"
          width={48}
          height={48}
          radius="full"
          alt={`${data.name}'s logo`}
        />
        <Link
          href={`/groups/${data.id}`}
          className="line-clamp-1 font-medium text-lg hover:underline"
        >
          {data.name}
        </Link>
      </div>
      {data.description && (
        <ScrollShadow className="mt-3 max-h-15" title={data.description}>
          {data.description}
        </ScrollShadow>
      )}
      <div className="mt-3 flex justify-between">
        <p>{t("nChapters", { count: data.chaptersCount })}</p>
        <div className="flex items-center gap-2">
          <Link
            href={`https://discord.gg/${data.discord}`}
            className="transition-opacity hover:opacity-80 [&_path]:text-black dark:[&_path]:text-white [&_svg]:size-4"
          >
            <LinkIcon />
          </Link>
          <Link
            href={`https://discord.gg/${data.discord}`}
            className="transition-opacity hover:opacity-80 [&_svg]:size-5"
          >
            <DiscordLogo shadow={false} />
          </Link>
          <Link
            href={`https://discord.gg/${data.discord}`}
            className="transition-opacity hover:opacity-80 [&_svg]:size-4"
          >
            <XLogo color="inverted" />
          </Link>
        </div>
      </div>
    </HoverCardContent>
  )
}
