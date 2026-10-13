import * as stylex from "@stylexjs/stylex"
import { authClient } from "@taiyomoe/auth/client"
import { Eye, Logout, Monitor, Moon, Sun } from "@taiyomoe/ui/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import UnitedStatesFlag from "country-flag-icons/react/3x2/US"
import { use } from "react"
import { filter, isTruthy, join, map, pipe, take } from "remeda"
import { ContentFilterItems } from "@/components/settings/content-filter"
import { type Session, sessionQueryOptions } from "@/lib/queries/session"
import { ThemeContext } from "@/lib/theme"
import { m } from "@/paraglide/messages"

const THEMES = [
  { value: "light", label: m.shell_theme_light, icon: Sun },
  { value: "dark", label: m.shell_theme_dark, icon: Moon },
  { value: "system", label: m.shell_theme_system, icon: Monitor },
] as const
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
    minWidth: "14rem",
  },
  subPopup: {
    minWidth: "10rem",
  },
  contentFilterPopup: {
    minWidth: "12.5rem",
  },
  radioLabel: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
  },
  flag: {
    borderRadius: "0.1875rem",
    overflow: "hidden",
    boxShadow: `0 0 0 1px ${colors.border}`,
    display: "inline-flex",
    flexShrink: 0,
    height: "0.75rem",
    width: "1.125rem",
  },
  flagSvg: {
    display: "block",
    height: "100%",
    width: "100%",
  },
  trailing: {
    color: colors.mutedForeground,
    marginLeft: "auto",
  },
})

export function UserMenu({ user }: { user: Session["user"] }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const theme = use(ThemeContext)
  const signOut = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, null)
      await router.invalidate()
    },
  })
  const ThemeIcon = THEMES.find(({ value }) => value === theme.preference)?.icon ?? Moon

  return (
    <Menu>
      <MenuTrigger aria-label={m.shell_user_menu()} sx={styles.trigger}>
        <Avatar sx={styles.avatar}>
          {user.image !== undefined && user.image !== null && user.image !== "" ? (
            <AvatarImage alt="" src={user.image} />
          ) : null}
          <AvatarFallback sx={styles.fallback}>
            {pipe(
              user.name.split(/\s+/),
              filter(isTruthy),
              take(2),
              map((part) => part.charAt(0).toUpperCase()),
              join(""),
            )}
          </AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuPopup align="end" sideOffset={8} sx={styles.popup}>
        <MenuSub>
          <MenuSubTrigger>
            <ThemeIcon />
            {m.shell_theme()}
          </MenuSubTrigger>
          <MenuSubPopup sx={styles.subPopup}>
            <MenuRadioGroup onValueChange={theme.setPreference} value={theme.preference}>
              {THEMES.map(({ value, label, icon: Icon }) => (
                <MenuRadioItem closeOnClick={false} key={value} value={value}>
                  <span sx={styles.radioLabel}>
                    <Icon />
                    {label()}
                  </span>
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuSubPopup>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>
            <Eye />
            {m.content_filter()}
          </MenuSubTrigger>
          <MenuSubPopup sx={styles.contentFilterPopup}>
            <ContentFilterItems />
          </MenuSubPopup>
        </MenuSub>
        <MenuItem disabled>
          <span sx={styles.flag}>
            <UnitedStatesFlag {...stylex.props(styles.flagSvg)} />
          </span>
          {m.shell_language()}
          <span sx={styles.trailing}>{m.shell_language_english()}</span>
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          disabled={signOut.isPending}
          onClick={() => {
            signOut.mutate()
          }}
          variant="destructive"
        >
          <Logout />
          {m.home_sign_out()}
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}
