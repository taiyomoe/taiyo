import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useSidebar } from "@taiyomoe/ui/components/ui/sidebar"
import { breakpoints, colors, consts, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { lazy, Suspense, useEffect, useRef } from "react"
import type { Session } from "@/lib/session"
import { layout } from "@/components/layout/layout.stylex"
import { AppNavbarBrand } from "@/components/shell/app-navbar-brand"
import { AppNavbarSearch } from "@/components/shell/app-navbar-search"
import { NotificationBell } from "@/features/notifications/components/notification-bell"
import { useCurrentHref } from "@/hooks/use-current-href"
import { m } from "@/paraglide/messages"

const FILL_DISTANCE = 160
// The server renders the menu, and hydration keeps that markup until its code arrives.
const UserMenu = lazy(async () => ({
  default: (await import("@/components/shell/user-menu")).UserMenu,
}))
const styles = stylex.create({
  menuPlaceholder: {
    borderRadius: "50%",
    backgroundColor: colors.well,
    height: { default: "2.75rem", [breakpoints.sm]: "2.5rem" },
    width: { default: "2.75rem", [breakpoints.sm]: "2.5rem" },
  },
  header: {
    insetInline: 0,
    alignItems: "center",
    display: "flex",
    position: "fixed",
    zIndex: 30,
    height: "var(--navbar-height)",
    top: 0,
  },
  surface: {
    inset: 0,
    display: "flex",
    pointerEvents: "none",
    position: "absolute",
    zIndex: -1,
  },
  pane: {
    backgroundColor: `color-mix(in srgb, ${colors.background} 72%, transparent)`,
    borderBottomColor: colors.sidebarBorder,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  paneOverlay: {
    opacity: "var(--navbar-fill, 0)",
  },
  sidePane: {
    flexShrink: 0,
    transitionDuration: {
      default: motion.slide,
      [consts.reducedMotion]: "0s",
    },
    transitionProperty: "width",
    transitionTimingFunction: motion.easeOut,
    width: 0,
  },
  sidePaneOpen: {
    width: {
      default: 0,
      [breakpoints.md]: "var(--sidebar-width)",
    },
  },
  instant: {
    transitionDuration: "0s",
  },
  mainPane: {
    backdropFilter: "blur(16px) saturate(180%)",
    flexGrow: 1,
  },
  actions: {
    flex: "1",
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-end",
    paddingInlineEnd: layout.gutter,
    paddingInlineStart: "1rem",
    minWidth: 0,
  },
})

export function AppNavbar({
  user,
  overlay = false,
}: {
  user: Session["user"] | null
  overlay?: boolean
}) {
  const header = useRef<HTMLElement>(null)
  const { open, resizing } = useSidebar()

  useEffect(() => {
    const element = header.current

    if (!overlay || element === null) {
      return undefined
    }

    const update = () => {
      element.style.setProperty(
        "--navbar-fill",
        String(Math.min(window.scrollY / FILL_DISTANCE, 1)),
      )
    }

    update()
    window.addEventListener("scroll", update, { passive: true })

    return () => {
      window.removeEventListener("scroll", update)
      element.style.removeProperty("--navbar-fill")
    }
  }, [overlay])

  return (
    <header ref={header} sx={styles.header}>
      <div aria-hidden sx={styles.surface}>
        <div
          sx={[
            styles.pane,
            overlay && styles.paneOverlay,
            styles.sidePane,
            open && styles.sidePaneOpen,
            resizing && styles.instant,
          ]}
        />
        <div sx={[styles.pane, overlay && styles.paneOverlay, styles.mainPane]} />
      </div>
      <AppNavbarBrand />
      <div sx={styles.actions}>
        <AppNavbarSearch />
        {user === null ? (
          <SignInButton />
        ) : (
          <>
            <NotificationBell viewerId={user.id} />
            <Suspense fallback={<span aria-hidden sx={styles.menuPlaceholder} />}>
              <UserMenu user={user} />
            </Suspense>
          </>
        )}
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
