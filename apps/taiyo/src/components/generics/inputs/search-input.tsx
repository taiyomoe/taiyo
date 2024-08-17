import { Input, type InputProps } from "@nextui-org/input"
import { SearchIcon } from "lucide-react"

type Props = Omit<InputProps, "isClearable" | "startContent">

export const SearchInput = (props: Props) => (
  <Input
    startContent={
      <SearchIcon className="!duration-150 text-foreground-500 transition-colors" />
    }
    isClearable
    {...props}
  />
)
