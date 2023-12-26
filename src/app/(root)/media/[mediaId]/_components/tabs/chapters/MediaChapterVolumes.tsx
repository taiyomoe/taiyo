import type { Selection } from "@nextui-org/react"
import { Accordion, AccordionItem, Divider } from "@nextui-org/react"

import type { MediaLimitedChapterPagination } from "~/lib/types"
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils"

import { MediaChapterGroupCard } from "./MediaChapterGroupCard"
import { MediaChaptersTabPagination } from "./MediaChaptersTabPagination"

type Props = {
  chaptersPagination: MediaLimitedChapterPagination
  selectedKeys: Selection
  setSelectedKeys: (keys: Selection) => void
}

export const MediaChapterVolumes = ({
  chaptersPagination,
  selectedKeys,
  setSelectedKeys,
}: Props) => {
  const { chapters, totalPages } = chaptersPagination
  const computedVolumes = MediaChapterUtils.computeVolumes(chapters)

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
