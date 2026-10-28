import * as stylex from "@stylexjs/stylex"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { Embers } from "@/components/scene/embers"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { AuthCitations } from "@/features/auth/components/scene/auth-citations"
import { AuthSun } from "@/features/auth/components/scene/auth-sun"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    overflow: "hidden",
    paddingBlock: "2.75rem",
    paddingInline: "3.5rem",
    backgroundColor: scene.night,
    display: { [breakpoints.lg]: "flex", default: "none" },
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
    fontFamily: sceneFont.display,
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
