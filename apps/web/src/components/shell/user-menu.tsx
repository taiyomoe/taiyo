import * as stylex from "@stylexjs/stylex"
import {
  Dashboard,
  Eye,
  Logout,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
} from "@taiyomoe/ui/components/icons"
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
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import BrazilFlag from "country-flag-icons/react/3x2/BR"
import FranceFlag from "country-flag-icons/react/3x2/FR"
import UnitedStatesFlag from "country-flag-icons/react/3x2/US"
import { use } from "react"
import { filter, isTruthy, join, map, pipe, take } from "remeda"
import type { Session } from "@/lib/session"
import { AvatarBorder } from "@/components/avatar-border/avatar-border"
import { canOpenDashboard } from "@/features/dashboard/lib/dashboard"
import { ContentFilterItems } from "@/features/settings/components/content-filter"
import { useAuthActions } from "@/hooks/use-auth-actions"
import { ThemeContext } from "@/lib/theme"
import { m } from "@/paraglide/messages"
import { type Locale, getLocale, setLocale } from "@/paraglide/runtime"

const THEMES = [
  { value: "light", label: m.shell_theme_light, icon: Sun },
  { value: "dark", label: m.shell_theme_dark, icon: Moon },
  { value: "system", label: m.shell_theme_system, icon: Monitor },
] as const
const LANGUAGES = [
  { value: "en", label: "English", flag: UnitedStatesFlag },
  { value: "pt-BR", label: "Português (Brasil)", flag: BrazilFlag },
  { value: "fr", label: "Français", flag: FranceFlag },
] as const satisfies ReadonlyArray<{ value: Locale; label: string; flag: unknown }>
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
    height: { default: "2.75rem", [breakpoints.sm]: "2.5rem" },
    width: { default: "2.75rem", [breakpoints.sm]: "2.5rem" },
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
})

export function UserMenu({ user }: { user: Session["user"] }) {
  const auth = useAuthActions()
  const theme = use(ThemeContext)
  const signOut = useMutation({
    mutationFn: () => auth.signOut(),
  })
  const locale = getLocale()
  const LanguageFlag = LANGUAGES.find(({ value }) => value === locale)?.flag ?? UnitedStatesFlag
  const ThemeIcon = THEMES.find(({ value }) => value === theme.preference)?.icon ?? Moon

  return (
    <Menu>
      <MenuTrigger aria-label={m.shell_user_menu()} sx={styles.trigger}>
        <AvatarBorder border={user.avatarBorder}>
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
        </AvatarBorder>
      </MenuTrigger>
      <MenuPopup align="end" sideOffset={8} sx={styles.popup}>
        {typeof user.username === "string" && user.username !== "" ? (
          <MenuItem render={<Link params={{ username: user.username }} to="/users/$username" />}>
            <User />
            {m.shell_my_profile()}
          </MenuItem>
        ) : null}
        <MenuItem render={<Link to="/settings" />}>
          <Settings />
          {m.user_settings_title()}
        </MenuItem>
        {canOpenDashboard(user) ? (
          <MenuItem render={<Link to="/dashboard" />}>
            <Dashboard />
            {m.dashboard_name()}
          </MenuItem>
        ) : null}
        <MenuSeparator />
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
        <MenuSub>
          <MenuSubTrigger>
            <span sx={styles.flag}>
              <LanguageFlag {...stylex.props(styles.flagSvg)} />
            </span>
            {m.shell_language()}
          </MenuSubTrigger>
          <MenuSubPopup sx={styles.subPopup}>
            <MenuRadioGroup
              onValueChange={(value: Locale) => {
                void setLocale(value)
              }}
              value={locale}
            >
              {LANGUAGES.map(({ value, label, flag: Flag }) => (
                <MenuRadioItem key={value} lang={value} value={value}>
                  <span sx={styles.radioLabel}>
                    <span sx={styles.flag}>
                      <Flag {...stylex.props(styles.flagSvg)} />
                    </span>
                    {label}
                  </span>
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuSubPopup>
        </MenuSub>
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
