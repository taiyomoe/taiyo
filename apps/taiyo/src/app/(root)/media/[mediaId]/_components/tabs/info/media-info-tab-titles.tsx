import { Chip } from "@nextui-org/chip"
import type { MediaLimited } from "@taiyomoe/types"
import { TitleUtils } from "@taiyomoe/utils"
import { Category } from "~/components/generics/Category"
import { List } from "~/components/generics/List"
import { CountryFlag } from "~/components/ui/CountryFlag"

type Props = {
  media: MediaLimited
}

export const MediaInfoTabTitles = ({ media }: Props) => {
  const sortedTitles = TitleUtils.sort(media.titles).filter(
    (x) => !x.isMainTitle,
  )

  return (
    <div className="col-span-2 items-start lg:col-span-1">
      {sortedTitles.length > 0 && (
        <Category title="Títulos alternativos">
          <List>
            {sortedTitles.map((item) => (
              <div
                key={item.language + item.title}
                className="flex items-center gap-2"
              >
                <div className="flex min-h-[24px] min-w-[24px]">
                  <CountryFlag language={item.language} />
                </div>
                <p>{item.title}</p>
                {item.isAcronym && (
                  <Chip
                    className="select-none uppercase"
                    color="default"
                    size="sm"
                  >
                    Acrônimo
                  </Chip>
                )}
              </div>
            ))}
          </List>
        </Category>
      )}
    </div>
  )
}
