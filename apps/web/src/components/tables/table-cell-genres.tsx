import { Chip } from "@nextui-org/chip"
import type { MediaGenres } from "@taiyomoe/db"
import { GENRES_PT } from "@taiyomoe/utils/i18n"
import { Tooltip } from "~/components/generics/tooltip"
import { cn } from "~/lib/utils/cn"

type Props = {
  genres: MediaGenres[]
}

export const TableCellGenres = ({ genres }: Props) => {
  const firstBatch = genres.slice(0, 3)
  const lastBatch = genres.slice(4, genres.length)

  const renderChip = (t: MediaGenres) => (
    <Chip key={t} size="sm">
      {GENRES_PT[t]}
    </Chip>
  )

  if (genres.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {firstBatch.map(renderChip)}
      {lastBatch.length !== 0 && (
        <Tooltip
          className={cn({ "rounded-r-none": lastBatch.length >= 15 })}
          content={lastBatch.map(renderChip)}
        >
          <Chip color="primary" variant="flat" size="sm">
            +{lastBatch.length}
          </Chip>
        </Tooltip>
      )}
    </div>
  )
}
