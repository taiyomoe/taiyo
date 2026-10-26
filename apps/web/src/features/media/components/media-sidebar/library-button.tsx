import * as stylex from "@stylexjs/stylex"
import { Bookmark, Check } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
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

type LibraryButtonProps = {
  mediaId: string
  status: LibraryStatus | null
}

export function LibraryButton({ mediaId, status }: LibraryButtonProps) {
  const setStatus = useSetLibraryStatus(mediaId)

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
            setStatus.mutate(value)
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
            <MenuItem
              onClick={() => {
                setStatus.mutate(null)
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
