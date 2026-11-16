import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Menu, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import type { LibraryEntry } from "@/features/library/api/library"
import { LibraryStatusMenuItems } from "@/features/library/components/library-status-menu-items"
import { useRemoveFromLibrary } from "@/features/library/hooks/use-remove-from-library"

const styles = stylex.create({
  popup: {
    minWidth: "14rem",
  },
})

export function LibraryEntryMenu({
  entry,
  trigger,
  align = "end",
}: {
  entry: LibraryEntry
  trigger: ReactElement
  align?: "start" | "center" | "end"
}) {
  const remove = useRemoveFromLibrary()

  return (
    <Menu>
      <MenuTrigger render={trigger} />
      <MenuPopup align={align} sx={styles.popup}>
        <LibraryStatusMenuItems
          mediaId={entry.mediaId}
          notify={entry.notify}
          onRemove={() => {
            remove(entry)
          }}
          status={entry.status}
        />
      </MenuPopup>
    </Menu>
  )
}
