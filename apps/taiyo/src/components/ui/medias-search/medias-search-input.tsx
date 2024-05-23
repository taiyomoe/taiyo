import { Kbd } from "@nextui-org/kbd"
import { Command } from "cmdk"
import { SearchIcon } from "lucide-react"
import { useSearchBox } from "react-instantsearch"

export const MediasSearchInput = () => {
  const { query, refine } = useSearchBox()

  return (
    <div className="flex w-full items-center border-content2 border-b px-4">
      <SearchIcon className="text-default-400 text-lg" strokeWidth={2} />
      <Command.Input
        className="h-14 w-full rounded-none bg-transparent px-2 font-sans text-default-600 text-lg outline-none placeholder:text-default-300"
        placeholder="Solo Leveling"
        value={query}
        onValueChange={refine}
        autoFocus
      />
      <Kbd className="ml-2 hidden bg-content3 px-2 py-1 font-medium text-[0.6rem] md:block">
        ESC
      </Kbd>
    </div>
  )
}
