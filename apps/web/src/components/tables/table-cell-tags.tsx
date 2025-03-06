import { Chip } from "@heroui/chip"
import { TAGS_PT } from "@taiyomoe/utils/i18n"
import { Tooltip } from "~/components/generics/tooltip"
import { cn } from "~/lib/utils/cn"

type Props = {
  tags: PrismaJson.MediaTag[]
}

export const TableCellTags = ({ tags }: Props) => {
  const firstBatch = tags.slice(0, 3)
  const lastBatch = tags.slice(4, tags.length)

  const renderChip = (t: PrismaJson.MediaTag) => (
    <Chip key={t.key} size="sm">
      {TAGS_PT[t.key].name}
    </Chip>
  )

  if (tags.length === 0) return null

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
