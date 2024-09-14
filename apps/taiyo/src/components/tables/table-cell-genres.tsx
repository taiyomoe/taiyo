import { Chip } from "@nextui-org/chip"
import { Tooltip } from "@nextui-org/tooltip"
import type { MediaGenres } from "@taiyomoe/db"
import { cn } from "~/lib/utils/cn"

type Props = {
  genres: MediaGenres[]
}

export const TableCellGenres = ({ genres }: Props) => {
  const firstBatch = genres.slice(0, 3)
  const lastBatch = genres.slice(4, genres.length)

  const renderChip = (t: MediaGenres) => (
    <Chip key={t} size="sm">
      {t}
    </Chip>
  )

  if (genres.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {firstBatch.map(renderChip)}
      {lastBatch.length !== 0 && (
        <Tooltip
          className={cn(
            "scrollbar-thin scrollbar-track-content2 scrollbar-thumb-primary flex max-h-80 w-[unset] max-w-64 flex-row flex-wrap gap-2 overflow-y-auto border border-default-200 p-2",
            { "rounded-r-none": lastBatch.length >= 15 },
          )}
          content={lastBatch.map(renderChip)}
          shadow="lg"
        >
          <Chip color="primary" variant="flat" size="sm">
            +{lastBatch.length}
          </Chip>
        </Tooltip>
      )}
    </div>
  )
}
