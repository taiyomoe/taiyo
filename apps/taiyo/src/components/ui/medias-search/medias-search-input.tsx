import { Kbd } from "@nextui-org/kbd"
import { Command } from "cmdk"
import { SearchIcon } from "lucide-react"

type Props = {
  onChange: (value: string) => void
}

export const MediasSearchInput = ({ onChange }: Props) => (
  <div className="flex w-full items-center border-content2 border-b px-4">
    <SearchIcon className="text-default-400 text-lg" strokeWidth={2} />
    <Command.Input
      className="h-14 w-full rounded-none bg-transparent px-2 font-sans text-default-600 text-lg outline-none placeholder:text-default-300"
      onValueChange={onChange}
      placeholder="Solo Leveling"
      autoFocus
    />
    <Kbd className="ml-2 hidden bg-content3 px-2 py-1 font-medium text-[0.6rem] md:block">
      ESC
    </Kbd>
  </div>
)
