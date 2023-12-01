import type { Selection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";

import { api } from "~/lib/trpc/client";
import type { UserLibraryMedia, UserLibraryStatus } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";
import { SelectUtils } from "~/lib/utils/select.utils";
import { useLibraryStore } from "~/stores";

type Props = {
  status: UserLibraryStatus;
  media: UserLibraryMedia;
};

export const UserLibrarySidebarStatusSelect = ({ status, media }: Props) => {
  const { updateEntry } = useLibraryStore();
  const { mutate } = api.libary.updateLibrary.useMutation();

  const handleSelectionChange = (selection: Selection) => {
    const selectedKey = SelectUtils.getSelectedKey(
      selection,
    ) as UserLibraryStatus;

    mutate({ mediaId: media.id, status: selectedKey });
    updateEntry(media, selectedKey);
  };

  return (
    <Select
      classNames={{
        trigger: "h-10",
      }}
      variant="bordered"
      selectedKeys={new Set([status])}
      disabledKeys={
        media.status !== "FINISHED" ? new Set(["completed"]) : new Set()
      }
      onSelectionChange={handleSelectionChange}
      aria-label="Status selection"
    >
      {LibraryUtils.getStatusKeys().map((status) => (
        <SelectItem key={status} value={status} color="default">
          {LibraryUtils.getStatusLabel(status)}
        </SelectItem>
      ))}
    </Select>
  );
};
