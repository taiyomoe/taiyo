import { ScrollShadow } from "@nextui-org/react"
import type { MediasIndexItem } from "@taiyomoe/types"
import { Command } from "cmdk"

type Props = {
  items: MediasIndexItem[]
}

export const MediasSearchResults = ({ items }: Props) => {
  console.log("items", items)

  return (
    <Command.Group
      className="w-full select-none sm:w-4/5"
      heading={
        <p className="text-[0.8rem] text-default-400 uppercase">Obras</p>
      }
      forceMount
    >
      {items.length === 0 && <Command.Empty>No results found.</Command.Empty>}
      <Command.List className="flex grow bg-emerald-600">
        <ScrollShadow className="scrollbar-none h-[300px] w-full">
          {items.map((item) => (
            <Command.Item key={item.id}>
              {item.titles.at(0)?.title}
            </Command.Item>
          ))}
        </ScrollShadow>
      </Command.List>
    </Command.Group>
  )
}
