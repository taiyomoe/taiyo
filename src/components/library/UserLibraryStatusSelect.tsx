import type { Dispatch } from "react";
import type { Selection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";
import type { SetStateAction } from "jotai";

import { api } from "~/lib/trpc/client";
import type {
  MediaLibraryStatus,
  MediaLimited,
  UserLibraryMedia,
} from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";
import { SelectUtils } from "~/lib/utils/select.utils";

type Props = {
  media: MediaLimited | UserLibraryMedia;
  currentStatus: Selection;
  setCurrentStatus: Dispatch<SetStateAction<Selection>>;
};

export const UserLibraryStatusSelect = (props: Props) => {
  const { media, currentStatus, setCurrentStatus } = props;
  const { mutate } = api.libary.updateLibrary.useMutation();

  const handleSelectionChange = (selection: Selection) => {
    const selectedKey = SelectUtils.getSelectedKey(selection) as
      | MediaLibraryStatus
      | "delete";

    mutate({ mediaId: media.id, status: selectedKey });
    setCurrentStatus(selectedKey === "delete" ? new Set([]) : selection);
  };

  return (
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
  );
};
