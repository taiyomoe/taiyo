import * as stylex from "@stylexjs/stylex"
import { Menu } from "@taiyomoe/ui/components/icons"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useSidebar } from "@taiyomoe/ui/components/ui/sidebar"
import { breakpoints, colors, consts, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { sceneFont } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  brand: {
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    transitionDuration: {
      default: motion.slide,
      [consts.reducedMotion]: "0s",
    },
    transitionProperty: "width",
    transitionTimingFunction: motion.easeOut,
    width: {
      default: "auto",
      [breakpoints.md]: "var(--sidebar-width)",
    },
  },
  brandCollapsed: {
    width: {
      default: "auto",
      [breakpoints.md]: "12.5rem",
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
      [consts.reducedMotion]: "0s",
    },
    transitionProperty: "width, margin-right, opacity",
    transitionTimingFunction: motion.easeOut,
    marginRight: "0.375rem",
    width: "2.25rem",
  },
  toggleSlotHidden: {
    opacity: {
      default: 1,
      [breakpoints.md]: 0,
    },
    marginRight: {
      default: "0.375rem",
      [breakpoints.md]: 0,
    },
    width: {
      default: "2.25rem",
      [breakpoints.md]: 0,
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
})

export function AppNavbarBrand() {
  const { isMobile, open, resizing, toggleSidebar } = useSidebar()
  const toggleHidden = open && !isMobile

  return (
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
  )
}
