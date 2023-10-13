"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Pagination } from "@nextui-org/pagination";
import { ChevronDownIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { useChapterPagination } from "~/hooks/useChapterPagination";

const pages = [5, 10, 20, 30];
const mediaChaptersTabPagination = tv({
  slots: {
    container: "flex justify-end gap-4",
    dropdownBase: "min-w-fit",
    dropdownMenu: "w-fit",
    triggerButton: "h-9 w-fit min-w-fit justify-between px-2",
  },
});

type Props = {
  totalPages: number;
};

export const MediaChaptersTabPagination = ({ totalPages }: Props) => {
  const { container, dropdownBase, dropdownMenu, triggerButton } =
    mediaChaptersTabPagination();

  const { page, perPage, handlePageChange, handlePerPageChange } =
    useChapterPagination();
  const [selectedKeys, setSelectedKeys] = useState(new Set([perPage]));

  return (
    <div className={container()}>
      <Dropdown classNames={{ base: dropdownBase() }} radius="sm">
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
          className={dropdownMenu()}
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) => {
            const newPerPage = Array.from(keys).join(", ").replaceAll("_", " ");

            // @ts-expect-error -- NextUI wrong types
            setSelectedKeys(keys);
            handlePerPageChange(newPerPage);
          }}
        >
          {pages.map((option) => (
            <DropdownItem key={option}>{option} caps.</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Pagination
        total={totalPages}
        initialPage={page}
        onChange={handlePageChange}
        color="primary"
        radius="sm"
      />
    </div>
  );
};
