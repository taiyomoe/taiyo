import { useQuery } from "@tanstack/react-query"
import { MapPin, UploadIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { HoverCardContent } from "~/components/ui/hover-card"
import { Image } from "~/components/ui/image"
import { ScrollShadow } from "~/components/ui/scroll-shadow"
import { Username } from "~/components/ui/username"
import { useTRPC } from "~/utils/trpc/react"
import { getAvatarUrl } from "~/utils/users/get-avatar-url"
import { getBannerUrl } from "~/utils/users/get-banner-url"
import { getName } from "~/utils/users/get-name"
import { UserHoverCardContentSkeleton } from "./user-hover-card-content-skeleton"

type Props = { id: string; enabled: boolean }

export const UserHoverCardContent = ({ id, enabled }: Props) => {
  const trpc = useTRPC()
  const { data, isFetching } = useQuery(
    trpc.users.getHoverCardContent.queryOptions(id, { enabled }),
  )
  const t = useTranslations("global")

  return (
    <HoverCardContent className="w-90">
      {isFetching && !data && <UserHoverCardContentSkeleton />}
      {data && (
        <>
          <div className="-mx-3 -mt-3 relative">
            <Image
              src={getBannerUrl(data.profile)}
              className="max-h-16 min-h-16 select-none object-cover"
              height={64}
              width={358}
              radius="none"
              alt={`${data.displayUsername}'s banner`}
            />
            <div className="absolute top-0 h-full max-h-16 w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))]" />
          </div>
          <div className="-mt-6 flex items-end gap-2">
            <Image
              src={getAvatarUrl(data)}
              className="max-size-12 min-size-12"
              width={48}
              height={48}
              radius="full"
              alt={`${getName(data)}'s avatar`}
            />
            <Link
              href={`/users/${data.id}`}
              className="line-clamp-1 font-medium text-lg hover:underline"
            >
              <Username user={data} />
            </Link>
          </div>
          {data.profile.about && (
            <ScrollShadow className="mt-3 max-h-15" title={data.profile.about}>
              {data.profile.about}
            </ScrollShadow>
          )}
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <MapPin className="size-4 text-subtle" />
              <p>{data.profile.city}</p>
            </div>
            <div className="flex items-center gap-1">
              <UploadIcon className="size-4 text-subtle" />
              {t("nUploadedChapters", { count: data.chaptersCount })}
            </div>
          </div>
        </>
      )}
    </HoverCardContent>
  )
}
