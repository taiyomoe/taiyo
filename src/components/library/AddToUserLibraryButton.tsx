"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import type { Selection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";
import { useSession } from "next-auth/react";

import { api } from "~/lib/trpc/client";
import type { MediaLibraryStatus, MediaLimited } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";

type Props = {
  media: MediaLimited;
};

export const AddToUserLibraryButton = ({ media }: Props) => {
  const { mutate } = api.libary.updateLibrary.useMutation();
  const [currentStatus, setCurrentStatus] = useState<Selection>(
    new Set(media.userLibraryStatus ? [media.userLibraryStatus] : []),
  );
  const { data: session } = useSession();

  if (!session) return null;

  const selectionToValue = (selection: Selection) =>
    (selection as Set<Selection>).values().next().value as
      | MediaLibraryStatus
      | "delete";

  const handleSelectionChange = (selection: Selection) => {
    const selectedKey = selectionToValue(selection);

    mutate({ mediaId: media.id, status: selectedKey });
    setCurrentStatus(selectedKey === "delete" ? new Set([]) : selection);
  };

  return (
    <Popover placement="bottom" showArrow title="Biblioteca">
      <PopoverTrigger>
        <Button
          className="text-md h-[38px] w-full font-medium md:w-auto"
          color="primary"
          radius="sm"
        >
          {LibraryUtils.getStatusLabel(selectionToValue(currentStatus))}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] px-4 py-3">
        <Select<MediaLibraryStatus>
          classNames={{
            trigger: "h-10",
            label: "text-small font-bold",
          }}
          label="Biblioteca"
          size="sm"
          fullWidth
          labelPlacement="outside"
          placeholder="Selecione uma opção"
          variant="bordered"
          selectedKeys={currentStatus}
          onSelectionChange={handleSelectionChange}
          selectionMode="single"
        >
          {LibraryUtils.getStatusKeys().map((status) => (
            <SelectItem
              key={status}
              value={status}
              color={status === "delete" ? "danger" : "default"}
            >
              {LibraryUtils.getStatusLabel(status)}
            </SelectItem>
          ))}
        </Select>
      </PopoverContent>
    </Popover>
  );
};
