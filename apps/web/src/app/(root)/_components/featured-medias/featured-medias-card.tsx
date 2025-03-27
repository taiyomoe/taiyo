import type { RouterOutputs } from "@taiyomoe/trpc"
import {} from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {} from "react"
import { useDynamicMedias } from "~/app/hooks/use-dynamic-medias"
import { Image } from "~/components/ui/image"
import { ScrollShadow } from "~/components/ui/scroll-shadow"
import { getBannerUrl } from "~/utils/medias/get-banner-url"
import { getCoverUrl } from "~/utils/medias/get-cover-url"

type Props = {
  media: RouterOutputs["medias"]["getFeaturedMedias"][number]
}

export const FeaturedMediasCard = ({ media }: Props) => {
  const { getDisplayTitle } = useDynamicMedias()
  const t = useTranslations("global.genres")

  return (
    <div key={media.id} className="relative flex-[0_0_100%]">
      <Link href={`/medias/${media.id}`}>
        <Image
          src={getBannerUrl(media.id, media.banners.at(-1)!)}
          className="max-h-(--featured-media-card-height) min-h-(--featured-media-card-height) select-none object-cover"
          width={1200}
          height={440}
          alt={`${getDisplayTitle(media.titles)}'s banner`}
        />
      </Link>
      <div className="absolute top-0 h-full max-h-(--featured-media-card-height) w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))]" />
      <div className="absolute inset-x-0 top-0 left-0 z-20 mx-auto my-[48] flex w-full max-w-9xl gap-4 p-4">
        <Image
          src={getCoverUrl(media.id, media.covers.at(-1)!)}
          className="aspect-7/10 max-h-[160] select-none md:max-h-[270] xl:max-h-[300]"
          width={200}
          height={300}
          radius="md"
          alt={`${getDisplayTitle(media.titles)}'s cover`}
          shouldZoom
        />
        <div className="space-y-2">
          <Link
            href={`/medias/${media.id}`}
            className="line-clamp-5 overflow-hidden font-bold text-2xl text-primary hover:underline sm:line-clamp-2 lg:text-4xl"
          >
            {getDisplayTitle(media.titles)}
          </Link>
          <div className="flex max-h-[112] flex-wrap gap-1 overflow-hidden">
            {media.genres.map((genre) => (
              <span
                key={genre}
                className="w-fit rounded border bg-subtle px-1.5 py-1 font-semibold text-[10px] uppercase"
              >
                {t(genre)}
              </span>
            ))}
          </div>
          <ScrollShadow className="hidden max-h-32 text-sm [word-break:break-word] md:block md:text-base">
            {media.synopsis}
          </ScrollShadow>
        </div>
      </div>
    </div>
  )
}
