import { ScrollShadow } from "@nextui-org/react"
import { useSession } from "@taiyomoe/auth/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { Command } from "cmdk"
import { useHits } from "react-instantsearch"
import { MediasSearchResultsItem } from "./medias-search-results-item"

export const MediasSearchResults = () => {
  const { data: session } = useSession()
  const { hits } = useHits<MediasIndexItem>()

  return (
    <Command.Group
      className="w-full select-none sm:w-4/5"
      heading={
        <p className="text-[0.8rem] text-default-400 uppercase">Obras</p>
      }
      forceMount
    >
      {hits.length === 0 && <Command.Empty>No results found.</Command.Empty>}
      <Command.List>
        <ScrollShadow className="scrollbar-none mt-2 flex h-[300px] w-full grow flex-col gap-1.5">
          {/* {items
            .filter((item) => activeFilters.includes(item.type))
            .map((item) => (
              <MediasSearchResultsItem
                key={item.id}
                item={item}
                preferredTitles={session?.user.preferredTitles}
              />
            ))} */}
          {hits.map((hit) => (
            <MediasSearchResultsItem
              key={hit.objectID}
              item={hit}
              preferredTitles={session?.user.preferredTitles}
            />
          ))}
        </ScrollShadow>
      </Command.List>
    </Command.Group>
  )
}
