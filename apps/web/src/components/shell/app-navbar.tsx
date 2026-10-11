import * as stylex from "@stylexjs/stylex"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { Menu, Search } from "@taiyomoe/ui/components/icons"
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

import { UserMenu } from "@/components/shell/user-menu"
import type { Session } from "@/lib/queries/session"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  header: {
    insetInline: 0,
    alignItems: "center",
    backdropFilter: "blur(16px) saturate(180%)",
    backgroundColor: `color-mix(in srgb, ${colors.background} 72%, transparent)`,
    display: "flex",
    position: "fixed",
    zIndex: 30,
    borderBottomColor: colors.sidebarBorder,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    height: "var(--navbar-height)",
    top: 0,
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
    fontSize: "1.25rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  search: {
    flex: "1",
    paddingInline: {
      default: "0.75rem",
      "@media (width >= 48rem)": "2rem",
    },
    display: { default: "none", [consts.sm]: "flex" },
    minWidth: 0,
  },
  field: {
    maxWidth: "30rem",
  },
  searchIcon: {
    height: "1.125rem",
    width: "1.125rem",
  },
  actions: {
    paddingInline: "1.25rem",
    alignItems: "center",
    display: "flex",
    marginLeft: "auto",
  },
})

export function AppNavbar({ user }: { user: Session["user"] }) {
  const { isMobile, open, resizing, toggleSidebar } = useSidebar()
  const toggleHidden = open && !isMobile
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <header sx={styles.header}>
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
      <div sx={styles.actions}>
        <UserMenu user={user} />
      </div>
    </header>
  )
}
