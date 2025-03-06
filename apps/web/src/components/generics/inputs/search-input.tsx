import { Input, type InputProps } from "@heroui/input"
import { SearchIcon } from "lucide-react"

type Props = Omit<InputProps, "isClearable" | "startContent">

export const SearchInput = (props: Props) => (
  <Input
    startContent={<SearchIcon className="text-foreground-500" />}
    isClearable
    {...props}
  />
)
