import { useState } from "react";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Pagination } from "@nextui-org/pagination";
import type { Selection } from "@nextui-org/react";
import { ChevronDownIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { useChapterPagination } from "~/hooks/useChapterPagination";
import { MEDIA_PER_PAGE_CHOICES } from "~/lib/constants";

const mediaChaptersTabPagination = tv({
  slots: {
    container: "flex justify-end gap-4",
    dropdownContent: "min-w-fit",
    triggerButton: "h-9 w-fit min-w-fit justify-between px-2",
  },
});

type Props = {
  totalPages: number;
};

export const MediaChaptersTabPagination = ({ totalPages }: Props) => {
  const { container, dropdownContent, triggerButton } =
    mediaChaptersTabPagination();

  const { page, perPage, handlePageChange, handlePerPageChange } =
    useChapterPagination();
  const [selectedKeys, setSelectedKeys] = useState(new Set([perPage]));

  const handleSelectionChange = (keys: Selection) => {
    const newPerPage = Array.from(keys).join(", ").replaceAll("_", " ");

    // @ts-expect-error -- NextUI wrong types
    setSelectedKeys(keys);
    handlePerPageChange(newPerPage);
  };

  return (
    <div className={container()}>
      <Dropdown classNames={{ content: dropdownContent() }} radius="sm">
        <DropdownTrigger>
          <Button
            className={triggerButton()}
            endContent={<ChevronDownIcon size={16} />}
            radius="sm"
          >
            {perPage}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
          aria-label="Capítulos por página"
        >
          {MEDIA_PER_PAGE_CHOICES.map((option) => (
            <DropdownItem key={option} textValue={`${option} caps.`}>
              {option} caps.
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Pagination
        total={totalPages}
        initialPage={page}
        page={page}
        onChange={handlePageChange}
        color="primary"
        radius="sm"
      />
    </div>
  );
};
