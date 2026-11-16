import * as stylex from "@stylexjs/stylex"
import { Bookmark } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Menu, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LibraryStatus } from "@/features/library/api/library"
import { LibraryStatusMenuItems } from "@/features/library/components/library-status-menu-items"
import {
  LIBRARY_STATUS_ICONS,
  LIBRARY_STATUS_LABELS,
} from "@/features/library/lib/library-statuses"
import { mediaSidebarStyles } from "@/features/media/components/media-sidebar/media-sidebar-styles"
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

export function LibraryButton({
  mediaId,
  notify,
  status,
}: {
  mediaId: string
  notify: boolean
  status: LibraryStatus | null
}) {
  const Icon = status === null ? Bookmark : LIBRARY_STATUS_ICONS[status]

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            size="lg"
            sx={[mediaSidebarStyles.library, status !== null && styles.libraryActive]}
            variant={status === null ? "outline" : "secondary"}
          />
        }
      >
        <Icon />
        {status === null ? m.media_library_add() : LIBRARY_STATUS_LABELS[status]()}
      </MenuTrigger>
      <MenuPopup align="center" sx={styles.menu}>
        <LibraryStatusMenuItems mediaId={mediaId} notify={notify} status={status} />
      </MenuPopup>
    </Menu>
  )
}
