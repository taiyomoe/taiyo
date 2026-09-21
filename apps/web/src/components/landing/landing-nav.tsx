import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { consts, font, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { useEffect, useState } from "react"

import { SunLink } from "@/components/buttons/sun-button"
import { scene } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  lockup: {
    gap: "0.75rem",
    fontSize: "23px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  header: {
    insetInline: 0,
    position: "fixed",
    transitionDuration: "200ms",
    transitionProperty: "background-color, border-color, backdrop-filter",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    zIndex: 50,
    top: 0,
  },
  headerAtTop: {
    borderBottomColor: "transparent",
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
  },
  headerScrolled: {
    backdropFilter: "blur(14px)",
    backgroundColor: `color-mix(in srgb, ${scene.night} 72%, transparent)`,
    borderBottomColor: `color-mix(in srgb, ${scene.paper} 8%, transparent)`,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
  },
  bar: {
    marginInline: "auto",
    paddingBlock: "1rem",
    paddingInline: "clamp(1.25rem,4vw,2.5rem)",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "75rem",
  },
  brand: {
    color: scene.paper,
    textDecorationLine: "none",
  },
  links: {
    gap: "1.875rem",
    alignItems: "center",
    // The three section links are the first thing to go on a narrow screen —
    // the logo and the CTA are what a phone visitor actually needs.
    display: { default: "none", [consts.sm]: "flex" },
  },
  link: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 72%, transparent)`,
      ":hover": scene.paper,
    },
    fontFamily: font.sans,
    fontSize: text.base,
    fontWeight: font.weightBold,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
  actions: {
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
  },
  signIn: {
    color: scene.paper,
    display: { default: "none", [consts.sm]: "inline" },
    fontFamily: font.sans,
    fontSize: text.base,
    fontWeight: font.weightBold,
    textDecorationLine: "none",
  },
})

export const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header sx={[styles.header, scrolled ? styles.headerScrolled : styles.headerAtTop]}>
      <div sx={styles.bar}>
        <Link to="/" {...stylex.props(styles.brand)}>
          <TaiyoLogoLockup sx={styles.lockup} />
        </Link>
        <nav sx={styles.links}>
          <a href="#titles" sx={styles.link}>
            {m.landing_nav_browse()}
          </a>
          <a href="#reviews" sx={styles.link}>
            {m.landing_nav_reviews()}
          </a>
        </nav>
        <div sx={styles.actions}>
          <Link to="/auth/sign-in" {...stylex.props(styles.signIn)}>
            {m.auth_sign_in()}
          </Link>
          <SunLink to="/auth/sign-up" size="md">
            {m.landing_nav_start()}
          </SunLink>
        </div>
      </div>
    </header>
  )
}
