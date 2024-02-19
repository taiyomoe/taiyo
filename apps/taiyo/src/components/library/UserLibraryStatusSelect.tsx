import type { Selection } from "@nextui-org/react"
import { Select, SelectItem } from "@nextui-org/select"
import type {
  MediaLimited,
  UserLibraryStatus,
  UserLibraryStatusWithDelete,
} from "@taiyomoe/types"
import { api } from "~/lib/trpc/client"
import { LibraryUtils } from "~/lib/utils/library.utils"
import { SelectUtils } from "~/lib/utils/select.utils"
import { useLibraryStore } from "~/stores"

type Props = {
  media: MediaLimited
  currentStatus?: UserLibraryStatus
}

export const UserLibraryStatusSelect = ({ media, currentStatus }: Props) => {
  const { updateEntry } = useLibraryStore()
  const { mutate } = api.libary.updateLibrary.useMutation()

  const handleSelectionChange = (selection: Selection) => {
    const selectedKey = SelectUtils.getSelectedKey(selection) as
      | UserLibraryStatus
      | "delete"

    mutate({ mediaId: media.id, status: selectedKey })
    updateEntry(media, selectedKey)
  }

  return (
    <Select<UserLibraryStatus>
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
      selectedKeys={currentStatus ? new Set([currentStatus]) : new Set()}
      disabledKeys={
        media.status !== "FINISHED" ? new Set(["completed"]) : new Set()
      }
      onSelectionChange={handleSelectionChange}
      selectionMode="single"
    >
      {(LibraryUtils.getStatusKeys() as UserLibraryStatusWithDelete[])
        .concat(currentStatus ? ["delete"] : [])
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
  )
}
