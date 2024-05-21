import { Kbd } from "@nextui-org/react"
import { CommandInput } from "cmdk"
import { SearchIcon } from "lucide-react"

export const MediasSearchInput = () => (
  <div className="flex w-full items-center border-content2 border-b px-4">
    <SearchIcon className="text-default-400 text-lg" strokeWidth={2} />
    <CommandInput className="placeholder:default-300 h-14 w-full rounded-none bg-transparent px-2 font-sans text-default-500 text-lg outline-none" />
    <Kbd className="ml-2 hidden bg-content3 px-2 py-1 font-medium text-[0.6rem] md:block">
      ESC
    </Kbd>
  </div>
)
