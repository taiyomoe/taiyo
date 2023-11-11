import { Accordion, AccordionItem, Divider } from "@nextui-org/react";

import type { MediaLimited } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

import { MediaChapterGroupCard } from "./MediaChapterGroupCard";
import { MediaChaptersTabPagination } from "./MediaChaptersTabPagination";

type Props = {
  media: MediaLimited;
  selectedKeys: Set<string>;
  setSelectedKeys: (keys: Set<string>) => void;
};

export const MediaChapterVolumes = ({
  media,
  selectedKeys,
  setSelectedKeys,
}: Props) => {
  const computedVolumes = MediaChapterUtils.computeVolumes(media.chapters);

  return (
    <div>
      <Accordion
        className={"px-0"}
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
            title={`Volume ${volume}`}
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
      <MediaChaptersTabPagination totalPages={media.totalPages} />
    </div>
  );
};
