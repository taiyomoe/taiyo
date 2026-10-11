import * as stylex from "@stylexjs/stylex"
import { authClient } from "@taiyomoe/auth/client"
import { Logout } from "@taiyomoe/ui/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { type Session, sessionQueryOptions } from "@/lib/queries/session"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  trigger: {
    padding: 0,
    borderRadius: radius.full,
    borderStyle: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "inline-flex",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
  },
  avatar: {
    fontSize: "0.8125rem",
    fontWeight: 600,
    height: "2.25rem",
    width: "2.25rem",
  },
  fallback: {
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
  popup: {
    minWidth: "15rem",
  },
  identity: {
    gap: "0.125rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: "0.875rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  email: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

export function UserMenu({ user }: { user: Session["user"] }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const signOut = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, null)
      await router.invalidate()
    },
  })

  return (
    <Menu>
      <MenuTrigger aria-label={m.shell_user_menu()} sx={styles.trigger}>
        <Avatar sx={styles.avatar}>
          {user.image ? <AvatarImage alt="" src={user.image} /> : null}
          <AvatarFallback sx={styles.fallback}>{initialsOf(user.name)}</AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuPopup align="end" sideOffset={8} sx={styles.popup}>
        <div sx={styles.identity}>
          <span sx={styles.name}>{user.name}</span>
          <span sx={styles.email}>{user.email}</span>
        </div>
        <MenuSeparator />
        <MenuItem disabled={signOut.isPending} onClick={() => signOut.mutate()}>
          <Logout />
          {m.home_sign_out()}
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}
