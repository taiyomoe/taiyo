import type { MediaLimited } from "@taiyomoe/types"
import { MediaCoverUtils } from "@taiyomoe/utils"
import { MediaImage } from "~/components/generics/images/MediaImage"
import { MediaLayoutLeftPanelTitle } from "./MediaLayoutLeftPanelTitle"

type Props = {
  media: MediaLimited
}

export const MediaLayoutLeftPanel = ({ media }: Props) => {
  const coverUrl = MediaCoverUtils.getUrl(media)

  return (
    <section className="z-10 flex h-fit w-[250px] flex-col items-center gap-8 md:sticky md:top-[calc(var(--navbar-height)+36px)] lg:w-[300px]">
      <MediaImage
        src={coverUrl}
        classNames={{
          height: "h-[350px] lg:h-[430px]",
          width: "min-w-[250px] lg:min-w-[300px]",
          img: "cover-url",
        }}
        maxHeight={300}
        maxWidth={400}
        alt="media's cover"
        isBlurred
      />
      <MediaLayoutLeftPanelTitle media={media} />
    </section>
  )
}
