import type { MediaLimited } from "@taiyomoe/types"
import { CoverUtils } from "@taiyomoe/utils"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { MediaLayoutLeftPanelTitle } from "./media-layout-left-panel-title"

type Props = {
  media: MediaLimited
}

export const MediaLayoutLeftPanel = ({ media }: Props) => {
  const coverUrl = CoverUtils.getUrl(media)

  return (
    <section className="z-10 flex h-fit w-full flex-col items-center gap-8 md:sticky md:top-[calc(var(--navbar-height)+36px)] md:w-[250px] lg:w-[300px]">
      <MediaImage
        src={coverUrl}
        classNames={{
          height: "max-h-[350px] lg:max-h-[430px]",
          width: "w-[250px] lg:w-[300px]",
          img: "cover-url",
        }}
        maxHeight={430}
        maxWidth={300}
        alt="media's cover"
        isBlurred
      />
      <MediaLayoutLeftPanelTitle media={media} />
    </section>
  )
}
