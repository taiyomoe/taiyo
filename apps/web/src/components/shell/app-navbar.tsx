import * as stylex from "@stylexjs/stylex"
import { Menu, Search } from "@taiyomoe/ui/components/icons"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"
import { useSidebar } from "@taiyomoe/ui/components/ui/sidebar"
import { colors, consts, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import type { Session } from "@/lib/session"
import { sceneFont } from "@/components/scene/scene.stylex"
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
      "@media (prefers-reduced-motion: reduce)": "0s",
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
      "@media (width >= 50rem)": "blur(16px) saturate(180%)",
    },
    backgroundColor: {
      default: "transparent",
      "@media (width >= 50rem)": `color-mix(in srgb, ${colors.background} 72%, transparent)`,
    },
    borderBottomColor: {
      default: "transparent",
      "@media (width >= 50rem)": colors.sidebarBorder,
    },
  },
  brand: {
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    transitionDuration: {
      default: motion.slide,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionProperty: "width",
    transitionTimingFunction: motion.easeOut,
    width: {
      default: "auto",
      "@media (width >= 50rem)": "var(--sidebar-width)",
    },
  },
  brandCollapsed: {
    width: {
      default: "auto",
      "@media (width >= 50rem)": "12.5rem",
    },
  },
  instant: {
    transitionDuration: "0s",
  },
  toggleSlot: {
    overflow: "hidden",
    display: "flex",
    flexShrink: 0,
    opacity: 1,
    transitionDuration: {
      default: motion.slide,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionProperty: "width, margin-right, opacity",
    transitionTimingFunction: motion.easeOut,
    marginRight: "0.375rem",
    width: "2.25rem",
  },
  toggleSlotHidden: {
    opacity: {
      default: 1,
      "@media (width >= 50rem)": 0,
    },
    marginRight: {
      default: "0.375rem",
      "@media (width >= 50rem)": 0,
    },
    width: {
      default: "2.25rem",
      "@media (width >= 50rem)": 0,
    },
  },
  toggle: {
    color: colors.mutedForeground,
    flexShrink: 0,
    height: "2.25rem",
    width: "2.25rem",
  },
  toggleIcon: {
    height: "1.25rem",
    width: "1.25rem",
  },
  home: {
    borderRadius: "0.5rem",
    color: colors.foreground,
    outlineColor: colors.ring,
    outlineOffset: 4,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    textDecorationLine: "none",
  },
  lockup: {
    gap: "0.625rem",
    fontFamily: sceneFont.display,
    fontSize: "1.25rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  search: {
    display: { default: "none", [consts.sm]: "flex" },
    flexBasis: "22rem",
    flexGrow: "0",
    flexShrink: "1",
    minWidth: 0,
  },
  field: {
    width: "100%",
  },
  searchIcon: {
    height: "1.125rem",
    width: "1.125rem",
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
  const { isMobile, open, resizing, toggleSidebar } = useSidebar()
  const toggleHidden = open && !isMobile
  const searchRef = useRef<HTMLInputElement>(null)
  const scrolled = useWindowScrolled()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <header sx={[styles.header, overlay && !scrolled && styles.headerOverlay]}>
      <div sx={[styles.brand, !open && styles.brandCollapsed, resizing && styles.instant]}>
        <div inert={toggleHidden} sx={[styles.toggleSlot, toggleHidden && styles.toggleSlotHidden]}>
          <Button
            aria-label={m.shell_toggle_sidebar()}
            onClick={toggleSidebar}
            size="icon-lg"
            sx={styles.toggle}
            variant="ghost"
          >
            <Menu {...stylex.props(styles.toggleIcon)} />
          </Button>
        </div>
        <Link to="/" {...stylex.props(styles.home)}>
          <TaiyoLogoLockup sx={styles.lockup} />
        </Link>
      </div>
      <div sx={styles.actions}>
        <div role="search" sx={styles.search}>
          <InputGroup sx={styles.field}>
            <InputGroupAddon>
              <Search {...stylex.props(styles.searchIcon)} />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={m.shell_search_label()}
              placeholder={m.shell_search_placeholder()}
              ref={searchRef}
            />
            <InputGroupAddon align="inline-end">
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          </InputGroup>
        </div>
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
