"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import type { Selection } from "@nextui-org/react";
import { useSession } from "next-auth/react";

import { UserLibraryStatusSelect } from "~/components/library/UserLibraryStatusSelect";
import type { MediaLimited, UserLibraryStatusWithDelete } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";

type Props = {
  media: MediaLimited;
};

export const AddToUserLibraryButton = ({ media }: Props) => {
  const [currentStatus, setCurrentStatus] = useState<Selection>(
    new Set(media.userLibraryStatus ? [media.userLibraryStatus] : []),
  );
  const { data: session } = useSession();

  if (!session) return null;

  const selectionToValue = (selection: Selection) =>
    (selection as Set<Selection>).values().next()
      .value as UserLibraryStatusWithDelete;

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
        <UserLibraryStatusSelect
          media={media}
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
        />
      </PopoverContent>
    </Popover>
  );
};
