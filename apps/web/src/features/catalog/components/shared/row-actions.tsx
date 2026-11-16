import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Ellipsis } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"

export type RowAction = {
  key: string
  label: string
  icon: (props: IconProps) => ReactElement
  render?: ReactElement
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
}

const styles = stylex.create({
  slot: {
    display: "flex",
    justifyContent: "flex-end",
  },
})

export function RowActions({ label, actions }: { label: string; actions: readonly RowAction[] }) {
  const safe = actions.filter((action) => action.destructive !== true)
  const destructive = actions.filter((action) => action.destructive === true)

  if (actions.length === 0) {
    return null
  }

  return (
    <div sx={styles.slot}>
      <Menu>
        <MenuTrigger render={<Button aria-label={label} size="icon-sm" variant="ghost" />}>
          <Ellipsis />
        </MenuTrigger>
        <MenuPopup align="end">
          {safe.map((action) => (
            <RowActionItem action={action} key={action.key} />
          ))}
          {safe.length > 0 && destructive.length > 0 ? <MenuSeparator /> : null}
          {destructive.map((action) => (
            <RowActionItem action={action} key={action.key} />
          ))}
        </MenuPopup>
      </Menu>
    </div>
  )
}

function RowActionItem({ action }: { action: RowAction }) {
  const Icon = action.icon

  return (
    <MenuItem
      disabled={action.disabled}
      onClick={action.onClick}
      render={action.render}
      variant={action.destructive === true ? "destructive" : "default"}
    >
      <Icon />
      {action.label}
    </MenuItem>
  )
}
