import { useState } from "react";
import type { Selection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";

import { api } from "~/lib/trpc/client";
import type { MediaLibraryStatus, UserLibraryMedia } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";
import { SelectUtils } from "~/lib/utils/select.utils";

type Props = {
  status: MediaLibraryStatus;
  media: UserLibraryMedia;
};

export const UserLibrarySidebarStatusSelect = ({ status, media }: Props) => {
  const [currentStatus, setCurrentStatus] = useState<Selection>(
    new Set([status]),
  );
  const { mutate } = api.libary.updateLibrary.useMutation();

  const handleSelectionChange = (selection: Selection) => {
    const selectedKey = SelectUtils.getSelectedKey(
      selection,
    ) as MediaLibraryStatus;

    mutate({ mediaId: media.id, status: selectedKey });
    setCurrentStatus(selection);
  };

  return (
    <Select
      classNames={{
        trigger: "h-10",
      }}
      variant="bordered"
      selectedKeys={currentStatus}
      onSelectionChange={handleSelectionChange}
    >
      {LibraryUtils.getStatusKeys()
        .filter((s) => s !== "delete")
        .map((status) => (
          <SelectItem
            key={status}
            value={status}
            color={status === "delete" ? "danger" : "default"}
          >
            {LibraryUtils.getStatusLabel(status)}
          </SelectItem>
        ))}
    </Select>
  );
};
