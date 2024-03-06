import type { MediaLimited } from "@taiyomoe/types"
import { TAGS_PT } from "@taiyomoe/utils/i18n"
import { Category } from "~/components/generics/Category"

type Props = {
  media: MediaLimited
}

export const MediaInfoTabTags = ({ media }: Props) => (
  <div className="items-start">
    {media.genres.length > 0 && (
      <Category title="Tags">
        <div className="flex flex-wrap gap-2">
          {media.tags.map((item) => (
            <div
              key={item.key}
              className="flex select-none gap-1 rounded-md bg-default-200 px-2 py-1.5 text-sm text-foreground"
            >
              <p>{TAGS_PT[item.key].name}</p>
            </div>
          ))}
        </div>
      </Category>
    )}
  </div>
)
