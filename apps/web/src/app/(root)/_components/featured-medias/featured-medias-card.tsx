import type { RouterOutputs } from "@taiyomoe/trpc"
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

  return (
    <div key={media.id} className="relative flex-[0_0_100%]">
      <Image
        src={getBannerUrl(media.id, media.banners.at(0)!)}
        className="max-h-[340px] min-h-[340px] select-none object-cover md:max-h-[400px] md:min-h-[400px] xl:max-h-[440px] xl:min-h-[440px]"
        width={1200}
        height={440}
        alt={`${getDisplayTitle(media.titles)}'s banner`}
      />
      <div className="absolute top-0 h-full max-h-[340px] w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))] md:max-h-[400px] xl:max-h-[440px]" />
      <div className="absolute inset-x-0 top-0 left-0 z-20 mx-auto mt-[50] flex w-full max-w-9xl gap-4 p-4">
        <Image
          src={getCoverUrl(media.id, media.covers.at(0)!)}
          className="aspect-7/10 max-h-[160] select-none rounded md:max-h-[300]"
          width={200}
          height={300}
          alt={`${getDisplayTitle(media.titles)}'s cover`}
        />
        <div className="space-y-2">
          <h2 className="line-clamp-5 overflow-hidden font-bold text-2xl text-primary sm:line-clamp-2 lg:text-4xl">
            {getDisplayTitle(media.titles)}
          </h2>
          <ScrollShadow className="hidden max-h-32 text-sm text-subtle md:block md:text-base">
            {media.synopsis}
          </ScrollShadow>
        </div>
      </div>
    </div>
  )
}
