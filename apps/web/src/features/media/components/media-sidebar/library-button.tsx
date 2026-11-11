import * as stylex from "@stylexjs/stylex"
import { Bookmark, Check } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { type LibraryStatus, useSetLibraryStatus } from "@/features/media/api/library"
import { mediaSidebarStyles } from "@/features/media/components/media-sidebar/media-sidebar-styles"
import { LIBRARY_STATUSES, LIBRARY_STATUS_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  libraryActive: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 12%, ${colors.card})`,
    color: `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
  },
  menu: {
    minWidth: "14rem",
  },
})
const SILENT_STATUSES: ReadonlySet<LibraryStatus> = new Set(["DROPPED", "COMPLETED"])

export function LibraryButton({
  mediaId,
  notify,
  status,
}: {
  mediaId: string
  notify: boolean
  status: LibraryStatus | null
}) {
  const setStatus = useSetLibraryStatus()

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            sx={[mediaSidebarStyles.library, status !== null && styles.libraryActive]}
            variant={status === null ? "outline" : "secondary"}
          />
        }
      >
        {status === null ? <Bookmark /> : <Check />}
        {status === null ? m.media_library_add() : LIBRARY_STATUS_LABELS[status]()}
      </MenuTrigger>
      <MenuPopup align="center" sx={styles.menu}>
        <MenuRadioGroup
          onValueChange={(value: LibraryStatus) => {
            setStatus.mutate({ mediaId, status: value })
          }}
          value={status}
        >
          {LIBRARY_STATUSES.map((value) => (
            <MenuRadioItem key={value} value={value}>
              {LIBRARY_STATUS_LABELS[value]()}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        {status === null ? null : (
          <>
            <MenuSeparator />
            <MenuCheckboxItem
              checked={notify && !SILENT_STATUSES.has(status)}
              closeOnClick={false}
              disabled={SILENT_STATUSES.has(status)}
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
                setStatus.mutate({ mediaId, status: null })
              }}
              variant="destructive"
            >
              {m.media_library_remove()}
            </MenuItem>
          </>
        )}
      </MenuPopup>
    </Menu>
  )
}
