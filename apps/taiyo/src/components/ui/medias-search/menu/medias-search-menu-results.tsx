import { ScrollShadow } from "@nextui-org/scroll-shadow"
import { useSession } from "@taiyomoe/auth/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { Command } from "cmdk"
import { useHits } from "react-instantsearch"
import { MediasSearchResultsItem } from "./medias-search-menu-results-item"

type Props = {
  toggleModal: () => void
}

export const MediasSearchResults = (props: Props) => {
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
          {hits.map((hit) => (
            <MediasSearchResultsItem
              key={hit.id}
              item={hit}
              preferredTitles={session?.user.preferredTitles}
              {...props}
            />
          ))}
        </ScrollShadow>
      </Command.List>
    </Command.Group>
  )
}
