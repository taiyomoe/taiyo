import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Image, UserRemove } from "@taiyomoe/ui/components/icons"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import { m } from "@/paraglide/messages"

/**
 * The owner's control for a profile image: straight to the file picker when
 * there is nothing to remove, a small menu otherwise.
 */
export function ProfileImageMenu({
  label,
  sx,
  children,
  hasImage,
  removeLabel,
  onPick,
  onRemove,
}: {
  label: string
  sx: Sx
  children: ReactNode
  hasImage: boolean
  removeLabel: string
  onPick: () => void
  onRemove: () => void
}) {
  if (!hasImage) {
    return (
      <button aria-label={label} onClick={onPick} {...stylex.props(sx)} type="button">
        {children}
      </button>
    )
  }

  return (
    <Menu>
      <MenuTrigger aria-label={label} sx={sx}>
        {children}
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuItem onClick={onPick}>
          <Image />
          {m.profile_upload_image()}
        </MenuItem>
        <MenuItem onClick={onRemove} variant="destructive">
          <UserRemove />
          {removeLabel}
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}
