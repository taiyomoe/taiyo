import type { MediasIndexItem } from "@taiyomoe/types"
import { MediaCoverUtils } from "@taiyomoe/utils"
import { MediaImage } from "~/components/generics/images/MediaImage"

type Props = {
  item: MediasIndexItem
  title: string
}

export const MediasSearchAutocompleteItem = (props: Props) => {
  const { item, title } = props

  return (
    <div className="group flex gap-2 transition-background duration-200">
      <MediaImage
        src={MediaCoverUtils.getUrl({
          id: item.id,
          coverId: item.mainCoverId,
        })}
        classNames={{
          height: "min-h-[85px] h-[85px]",
          width: "min-w-[65px] w-[65px]",
        }}
        maxHeight={85}
        maxWidth={65}
        radius="sm"
        alt="Cover image"
      />
      <div className="w-fit">
        <p
          className="line-clamp-1 font-medium text-lg group-hover:underline"
          title={title}
        >
          {title}
        </p>
        <p
          className="line-clamp-2 text-wrap text-default-500 italic"
          title={item.synopsis ?? ""}
        >
          {item.synopsis}
        </p>
      </div>
    </div>
  )
}
