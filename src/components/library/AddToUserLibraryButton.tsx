"use client";

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { useSession } from "next-auth/react";

import { UserLibraryStatusSelect } from "~/components/library/UserLibraryStatusSelect";
import type { MediaLimited, UserLibraryMedia } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";
import { useLibraryStore } from "~/stores";

type Props = {
  media: MediaLimited;
};

export const AddToUserLibraryButton = ({ media }: Props) => {
  const { updateEntry } = useLibraryStore();
  const [entry, setEntry] = useState<UserLibraryMedia | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (media.userLibrary && !entry) {
      updateEntry(media, media.userLibrary.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return null;

  useLibraryStore.subscribe((state) => {
    const entry = state.getEntry(media.id);

    setEntry(entry ?? null);
  });

  return (
    <Popover placement="bottom" showArrow title="Biblioteca">
      <PopoverTrigger>
        <Button
          className="text-md h-[38px] w-full font-medium md:w-auto"
          color="primary"
          radius="sm"
        >
          {LibraryUtils.getStatusLabel(entry?.libraryStatus)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] px-4 py-3">
        <UserLibraryStatusSelect
          media={media}
          currentStatus={entry?.libraryStatus}
        />
      </PopoverContent>
    </Popover>
  );
};
