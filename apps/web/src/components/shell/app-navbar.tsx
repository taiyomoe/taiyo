import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, consts, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { Session } from "@/lib/session"
import { AppNavbarBrand } from "@/components/shell/app-navbar-brand"
import { AppNavbarSearch } from "@/components/shell/app-navbar-search"
import { UserMenu } from "@/components/shell/user-menu"
import { useCurrentHref } from "@/hooks/use-current-href"
import { useWindowScrolled } from "@/hooks/use-window-scrolled"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  header: {
    insetInline: 0,
    alignItems: "center",
    backdropFilter: "blur(16px) saturate(180%)",
    backgroundColor: `color-mix(in srgb, ${colors.background} 72%, transparent)`,
    display: "flex",
    position: "fixed",
    transitionDuration: {
      default: motion.enterLarge,
      [consts.reducedMotion]: "0s",
    },
    transitionProperty: "background-color, border-color, backdrop-filter",
    transitionTimingFunction: motion.easeOut,
    zIndex: 30,
    borderBottomColor: colors.sidebarBorder,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    height: "var(--navbar-height)",
    top: 0,
  },
  headerOverlay: {
    backdropFilter: {
      default: "blur(0px) saturate(100%)",
      [breakpoints.md]: "blur(16px) saturate(180%)",
    },
    backgroundColor: {
      default: "transparent",
      [breakpoints.md]: `color-mix(in srgb, ${colors.background} 72%, transparent)`,
    },
    borderBottomColor: {
      default: "transparent",
      [breakpoints.md]: colors.sidebarBorder,
    },
  },
  actions: {
    flex: "1",
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-end",
    paddingInlineEnd: "1.25rem",
    paddingInlineStart: "1rem",
    minWidth: 0,
  },
})

type AppNavbarProps = {
  user: Session["user"] | null
  overlay?: boolean
}

export function AppNavbar({ user, overlay = false }: AppNavbarProps) {
  const scrolled = useWindowScrolled()

  return (
    <header sx={[styles.header, overlay && !scrolled && styles.headerOverlay]}>
      <AppNavbarBrand />
      <div sx={styles.actions}>
        <AppNavbarSearch />
        {user === null ? <SignInButton /> : <UserMenu user={user} />}
      </div>
    </header>
  )
}

function SignInButton() {
  const href = useCurrentHref()

  return (
    <Button render={<Link search={{ redirect: href }} to="/auth/sign-in" />}>
      {m.auth_sign_in()}
    </Button>
  )
}
