import { Accordion, AccordionItem, Divider } from "@nextui-org/react";

import type { MediaLimitedChapterPagination } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

import { MediaChapterGroupCard } from "./MediaChapterGroupCard";
import { MediaChaptersTabPagination } from "./MediaChaptersTabPagination";

type Props = {
  chaptersPagination: MediaLimitedChapterPagination;
  selectedKeys: Set<string>;
  setSelectedKeys: (keys: Set<string>) => void;
};

export const MediaChapterVolumes = ({
  chaptersPagination,
  selectedKeys,
  setSelectedKeys,
}: Props) => {
  const { chapters, totalPages } = chaptersPagination;
  const computedVolumes = MediaChapterUtils.computeVolumes(chapters);

  return (
    <div>
      <Accordion
        className="space-y-4 px-0"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        expandedKeys={selectedKeys}
        defaultExpandedKeys={selectedKeys}
        // @ts-expect-error -- NextUI wrong types
        onSelectionChange={setSelectedKeys}
      >
        {computedVolumes.map(({ volume, groups }) => (
          <AccordionItem
            key={`volume-${volume}`}
            title={volume === "null" ? "Sem volume" : `Volume ${volume}`}
            classNames={{
              content: "flex flex-col gap-8",
            }}
          >
            {groups.map((group, i) => (
              <div key={group.number} className="flex flex-col gap-1">
                <h3 className="text-sm">Capítulo {group.number}</h3>
                <MediaChapterGroupCard key={i} group={group} />
              </div>
            ))}
          </AccordionItem>
        ))}
      </Accordion>
      <Divider className="my-4" />
      <MediaChaptersTabPagination totalPages={totalPages} />
    </div>
  );
};
