import type { UsersIndexItem } from "@taiyomoe/types"
import { UserUtils } from "@taiyomoe/utils"
import { MediaImage } from "~/components/images/MediaImage"

type Props = {
  item: UsersIndexItem
}

export const UsersAutocompleteItem = ({ item }: Props) => (
  <div className="group flex gap-4 transition-background duration-200">
    <MediaImage
      src={UserUtils.getAvatarUrl(item)}
      classNames={{
        height: "min-h-[48px] h-[48px]",
        width: "min-w-[48px] w-[48px]",
      }}
      maxHeight={48}
      maxWidth={48}
      radius="full"
      alt="User's avatar"
    />
    <div className="flex grow flex-col">
      <p className="line-clamp-1 font-medium text-lg group-hover:underline">
        {item.name}
      </p>
      <p className="line-clamp-2 text-default-500 italic">{item.about}</p>
    </div>
  </div>
)
