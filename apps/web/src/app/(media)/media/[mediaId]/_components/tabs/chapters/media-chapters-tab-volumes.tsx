import { Accordion, AccordionItem } from "@heroui/accordion"
import { Divider } from "@heroui/divider"
import type { Selection } from "@heroui/react"
import type { MediaLimitedChapterPagination } from "@taiyomoe/types"
import { ChapterUtils } from "@taiyomoe/utils"
import { MediaChapterGroupCard } from "./media-chapters-tab-group-card"
import { MediaChaptersTabPagination } from "./media-chapters-tab-pagination"

type Props = {
  chaptersPagination: MediaLimitedChapterPagination
  selectedKeys: Selection
  setSelectedKeys: (keys: Selection) => void
}

export const MediaChaptersTabVolumes = ({
  chaptersPagination,
  selectedKeys,
  setSelectedKeys,
}: Props) => {
  const { chapters, totalPages } = chaptersPagination
  const computedVolumes = ChapterUtils.computeVolumeGroups(chapters)

  return (
    <div>
      <Accordion
        className="space-y-4 px-0"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        expandedKeys={selectedKeys}
        defaultExpandedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        {computedVolumes.map(({ volume, groups }) => (
          <AccordionItem
            key={`volume-${volume}`}
            title={volume === "null" ? "Sem volume" : `Volume ${volume}`}
            classNames={{
              content: "flex flex-col gap-4",
            }}
          >
            {groups.map((group) => (
              <div key={group.number} className="flex flex-col gap-1">
                <h3 className="text-sm">Capítulo {group.number}</h3>
                <MediaChapterGroupCard key={group.number} group={group} />
              </div>
            ))}
          </AccordionItem>
        ))}
      </Accordion>
      <Divider className="my-4" />
      <MediaChaptersTabPagination totalPages={totalPages} />
    </div>
  )
}
