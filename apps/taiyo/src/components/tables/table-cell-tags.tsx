import { Chip } from "@nextui-org/chip"
import { Tooltip } from "@nextui-org/tooltip"
import { cn } from "~/lib/utils/cn"

type Props = {
  tags: PrismaJson.MediaTag[]
}

export const TableCellTags = ({ tags }: Props) => {
  const firstBatch = tags.slice(0, 3)
  const lastBatch = tags.slice(4, tags.length)

  const renderChip = (t: PrismaJson.MediaTag) => (
    <Chip key={t.key} size="sm">
      {t.key}
    </Chip>
  )

  if (tags.length === 0) return null

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
