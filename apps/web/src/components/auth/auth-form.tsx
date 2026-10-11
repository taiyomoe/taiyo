import * as stylex from "@stylexjs/stylex"
import { font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"

import { AuthScene } from "@/components/auth/scene/auth-scene"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { scene } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const TABS = [
  { type: "sign-up", label: m.auth_sign_up, to: "/auth/sign-up" },
  { type: "sign-in", label: m.auth_sign_in, to: "/auth/sign-in" },
] as const
const LG = "@media (width >= 64rem)"
const styles = stylex.create({
  screen: {
    overflow: "hidden",
    backgroundColor: scene.night,
    color: scene.paper,
    display: "grid",
    gridTemplateColumns: { [LG]: "1.05fr 0.95fr", default: null },
    height: "100svh",
  },
  panel: {
    paddingBlock: "2rem",
    paddingInline: "clamp(28px,5vw,76px)",
    backgroundImage: "linear-gradient(180deg, #1b0f0a, #150c08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    scrollbarWidth: "none",
    height: "100svh",
    overflowY: "auto",
  },
  column: {
    marginInline: "auto",
    maxWidth: "26.875rem",
    width: "100%",
  },
  tabs: {
    padding: "0.25rem",
    borderColor: `color-mix(in srgb, ${scene.paper} 8%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    backgroundColor: `color-mix(in srgb, ${scene.paper} 6%, transparent)`,
    display: "inline-flex",
  },
  tab: {
    borderRadius: radius.full,
    borderStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: "1.25rem",
    backgroundColor: "transparent",
    color: {
      default: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
      ":hover": scene.paper,
    },
    cursor: "pointer",
    fontFamily: font.sans,
    fontSize: "0.875rem",
    fontWeight: 700,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
  },
  // Applied after `tab` rather than through a `[data-active]` condition:
  // a later argument to stylex.props() always wins, whereas an attribute
  // condition and the `:hover` above could resolve either way.
  tabActive: {
    backgroundColor: scene.paper,
    color: "#1b0f0a",
  },
})

export const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => (
  <div data-auth-screen sx={styles.screen}>
    <AuthScene />
    <div sx={styles.panel}>
      <div sx={styles.column}>
        <div sx={styles.tabs}>
          {TABS.map((tab) => (
            <Link
              key={tab.type}
              to={tab.to}
              data-active={tab.type === type}
              sx={[styles.tab, tab.type === type && styles.tabActive]}
            >
              {tab.label()}
            </Link>
          ))}
        </div>
        {type === "sign-in" ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  </div>
)
