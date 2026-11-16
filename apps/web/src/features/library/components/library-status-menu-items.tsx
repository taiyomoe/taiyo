import { Trash } from "@taiyomoe/ui/components/icons"
import {
  MenuCheckboxItem,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from "@taiyomoe/ui/components/ui/menu"
import { type LibraryStatus, useSetLibraryStatus } from "@/features/library/api/library"
import { LibraryStatusLabel } from "@/features/library/components/library-status-label"
import { LIBRARY_STATUSES, SILENT_LIBRARY_STATUSES } from "@/features/library/lib/library-statuses"
import { m } from "@/paraglide/messages"

export function LibraryStatusMenuItems({
  mediaId,
  notify,
  status,
  onRemove,
}: {
  mediaId: string
  notify: boolean
  status: LibraryStatus | null
  onRemove?: () => void
}) {
  const setStatus = useSetLibraryStatus()

  return (
    <>
      <MenuRadioGroup
        onValueChange={(value: LibraryStatus) => {
          setStatus.mutate({ mediaId, status: value })
        }}
        value={status}
      >
        {LIBRARY_STATUSES.map((value) => (
          <MenuRadioItem closeOnClick key={value} value={value}>
            <LibraryStatusLabel status={value} />
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>
      {status === null ? null : (
        <>
          <MenuSeparator />
          <MenuCheckboxItem
            checked={notify && !SILENT_LIBRARY_STATUSES.has(status)}
            closeOnClick={false}
            disabled={SILENT_LIBRARY_STATUSES.has(status)}
            onCheckedChange={(checked) => {
              setStatus.mutate({ mediaId, status, notify: checked })
            }}
            variant="switch"
          >
            {m.media_library_notify()}
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuItem
            onClick={() => {
              if (onRemove === undefined) {
                setStatus.mutate({ mediaId, status: null })
              } else {
                onRemove()
              }
            }}
            variant="destructive"
          >
            <Trash />
            {m.media_library_remove()}
          </MenuItem>
        </>
      )}
    </>
  )
}
