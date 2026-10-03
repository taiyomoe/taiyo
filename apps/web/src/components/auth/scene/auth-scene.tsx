import * as stylex from "@stylexjs/stylex"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"

import { AuthCitations } from "@/components/auth/scene/auth-citations"
import { AuthSun } from "@/components/auth/scene/auth-sun"
import { Embers } from "@/components/scene/embers"
import { scene } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const LG = "@media (width >= 64rem)"
const styles = stylex.create({
  root: {
    overflow: "hidden",
    paddingBlock: "2.75rem",
    paddingInline: "3.5rem",
    backgroundColor: scene.night,
    display: { [LG]: "flex", default: "none" },
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  logo: {
    opacity: { default: 1, ":hover": 0.8 },
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "opacity",
    zIndex: 3,
    width: "fit-content",
  },
  lockup: {
    gap: "0.75rem",
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  tagline: {
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    fontFamily: font.mono,
    fontSize: "13px",
    position: "relative",
    zIndex: 3,
  },
})

export const AuthScene = () => (
  <div sx={styles.root}>
    <AuthSun />
    <Embers />
    <Link to="/" {...stylex.props(styles.logo)}>
      <TaiyoLogoLockup sx={styles.lockup} />
    </Link>
    <AuthCitations />
    <div sx={styles.tagline}>{m.auth_tagline()}</div>
  </div>
)
