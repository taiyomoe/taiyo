import { Ellipsis } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { m } from "@/paraglide/messages"

export function MemberActionsMenu({
  name,
  items,
}: {
  name: string
  items: Array<{ key: string; label: string; destructive?: boolean; onClick: () => void }>
}) {
  return (
    <Menu>
      <MenuTrigger
        render={<Button aria-label={m.member_actions({ name })} size="icon-sm" variant="ghost" />}
      >
        <Ellipsis />
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuGroup>
          {items
            .filter((item) => item.destructive !== true)
            .map((item) => (
              <MenuItem key={item.key} onClick={item.onClick}>
                {item.label}
              </MenuItem>
            ))}
        </MenuGroup>
        {items.some((item) => item.destructive === true) ? (
          <>
            {items.some((item) => item.destructive !== true) ? <MenuSeparator /> : null}
            <MenuGroup>
              {items
                .filter((item) => item.destructive === true)
                .map((item) => (
                  <MenuItem key={item.key} onClick={item.onClick} variant="destructive">
                    {item.label}
                  </MenuItem>
                ))}
            </MenuGroup>
          </>
        ) : null}
      </MenuPopup>
    </Menu>
  )
}
