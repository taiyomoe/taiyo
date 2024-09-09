import { Kbd } from "@nextui-org/kbd"
import { SearchIcon } from "lucide-react"
import { useEventListener } from "usehooks-ts"

type Props = {
  onClick: () => void
}

export const MediasSearchButton = ({ onClick }: Props) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onClick()
    }
  }

  useEventListener("keydown", handleKeyDown)

  return (
    <div
      className="flex gap-6 rounded-full border-default-200 border-small bg-content1/80 px-2 py-1.5 transition-background hover:cursor-pointer hover:bg-content2"
      onClick={onClick}
    >
      <SearchIcon className="text-white" />
      <div>
        <Kbd
          className="bg-content3 text-content3-foreground"
          keys={["command"]}
        >
          K
        </Kbd>
      </div>
    </div>
  )
}
