import type { Languages } from "@taiyomoe/db"
import type { MediasIndexItem } from "@taiyomoe/types"
import { MediaCoverUtils, MediaUtils } from "@taiyomoe/utils"
import { CommandItem } from "cmdk"
import Link from "next/link"
import { MediaImage } from "~/components/generics/images/MediaImage"

type Props = {
  item: MediasIndexItem
  preferredTitles: Languages | undefined
  toggleModal: () => void
}

export const MediasSearchResultsItem = (props: Props) => {
  const { item, preferredTitles = "en", toggleModal } = props
  const title = MediaUtils.getMainTitle(item.titles, preferredTitles)

  return (
    <CommandItem asChild>
      <Link
        className="group flex w-full gap-2 rounded-small bg-content3 p-1.5 transition-background duration-200 hover:bg-content4"
        href={MediaUtils.getUrl(item)}
        onClick={toggleModal}
      >
        <MediaImage
          src={MediaCoverUtils.getUrl({
            id: item.id,
            coverId: item.mainCoverId,
          })}
          classNames={{
            height: "min-h-[110px] h-[110px]",
            width: "min-w-[85px] w-[85px]",
          }}
          maxHeight={110}
          maxWidth={85}
          radius="sm"
          alt="Cover image"
        />
        <div>
          <p
            className="line-clamp-1 font-medium text-lg group-hover:underline"
            title={title}
          >
            {title}
          </p>
          <p
            className="line-clamp-2 text-default-500 italic"
            title={item.synopsis ?? ""}
          >
            {item.synopsis}
          </p>
        </div>
      </Link>
    </CommandItem>
  )
}
